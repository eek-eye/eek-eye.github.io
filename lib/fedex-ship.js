'use strict';

/**
 * FedEx Ship API helpers (REST + OAuth2 client credentials).
 * Env: FEDEX_CLIENT_ID, FEDEX_CLIENT_SECRET, FEDEX_ACCOUNT_NUMBER, FEDEX_BASE_URL
 */

async function getAccessToken() {
    var base = (process.env.FEDEX_BASE_URL || 'https://apis-sandbox.fedex.com').replace(/\/$/, '');
    var id = process.env.FEDEX_CLIENT_ID;
    var secret = process.env.FEDEX_CLIENT_SECRET;
    if (!id || !secret) {
        var err = new Error('FedEx API credentials are not configured.');
        err.statusCode = 503;
        throw err;
    }
    var body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: id,
        client_secret: secret
    });
    var res = await fetch(base + '/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.access_token) {
        var e = new Error((data && data.error_description) || 'FedEx OAuth failed');
        e.statusCode = res.status;
        e.details = data;
        throw e;
    }
    return { token: data.access_token, base: base };
}

function shipFromAddress() {
    return {
        contact: {
            personName: process.env.SHIP_FROM_NAME || 'EeksEye',
            phoneNumber: process.env.SHIP_FROM_PHONE || '0000000000',
            companyName: process.env.SHIP_FROM_COMPANY || 'EeksEye'
        },
        address: {
            streetLines: [process.env.SHIP_FROM_LINE1 || 'TBD'].concat(
                process.env.SHIP_FROM_LINE2 ? [process.env.SHIP_FROM_LINE2] : []
            ),
            city: process.env.SHIP_FROM_CITY || 'TBD',
            stateOrProvinceCode: process.env.SHIP_FROM_STATE || 'CA',
            postalCode: process.env.SHIP_FROM_POSTAL || '00000',
            countryCode: process.env.SHIP_FROM_COUNTRY || 'US'
        }
    };
}

/**
 * @param {object} opts
 * @param {object} opts.recipient - { name, phone, email?, address lines... }
 * @param {number} [opts.weightLb]
 * @param {string} [opts.serviceType]
 * @param {string} [opts.orderId]
 */
async function createLabelPdf(opts) {
    var auth = await getAccessToken();
    var account = process.env.FEDEX_ACCOUNT_NUMBER;
    if (!account) {
        var err = new Error('FEDEX_ACCOUNT_NUMBER is not configured.');
        err.statusCode = 503;
        throw err;
    }

    var recipient = opts.recipient || {};
    var weight = Number(opts.weightLb || process.env.DEFAULT_PACKAGE_WEIGHT_LB || 1);
    var serviceType = opts.serviceType || process.env.FEDEX_SERVICE_TYPE || 'FEDEX_GROUND';

    var payload = {
        labelResponseOptions: 'LABEL',
        requestedShipment: {
            shipper: shipFromAddress(),
            recipients: [
                {
                    contact: {
                        personName: recipient.name || 'Customer',
                        phoneNumber: recipient.phone || '0000000000',
                        emailAddress: recipient.email || undefined
                    },
                    address: {
                        streetLines: recipient.streetLines || [recipient.line1 || 'TBD'],
                        city: recipient.city || 'TBD',
                        stateOrProvinceCode: recipient.state || 'CA',
                        postalCode: recipient.postalCode || '00000',
                        countryCode: recipient.country || 'US',
                        residential: recipient.residential !== false
                    }
                }
            ],
            shipDatestamp: new Date().toISOString().slice(0, 10),
            serviceType: serviceType,
            packagingType: process.env.FEDEX_PACKAGING || 'YOUR_PACKAGING',
            pickupType: process.env.FEDEX_PICKUP_TYPE || 'DROPOFF_AT_FEDEX_LOCATION',
            blockInsightVisibility: false,
            shippingChargesPayment: {
                paymentType: 'SENDER',
                payor: {
                    responsibleParty: {
                        accountNumber: { value: account }
                    }
                }
            },
            labelSpecification: {
                labelFormatType: 'COMMON2D',
                imageType: 'PDF',
                labelStockType: process.env.FEDEX_LABEL_STOCK || 'PAPER_4X6'
            },
            requestedPackageLineItems: [
                {
                    weight: { units: 'LB', value: weight }
                }
            ]
        },
        accountNumber: { value: account }
    };

    if (opts.orderId) {
        payload.requestedShipment.shippingDocumentSpecification = undefined;
        // correlate in FedEx customer references when supported
        payload.requestedShipment.requestedPackageLineItems[0].customerReferences = [
            { customerReferenceType: 'CUSTOMER_REFERENCE', value: String(opts.orderId).slice(0, 40) }
        ];
    }

    var res = await fetch(auth.base + '/ship/v1/shipments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + auth.token
        },
        body: JSON.stringify(payload)
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
        var e = new Error('FedEx create shipment failed');
        e.statusCode = res.status;
        e.details = data;
        throw e;
    }

    var tx = (((data.output || {}).transactionShipments) || [])[0] || {};
    var piece = ((tx.pieceResponses) || [])[0] || {};
    var pkgDocs = ((piece.packageDocuments) || (tx.shipmentDocuments) || [])[0] || {};
    var b64 = pkgDocs.encodedLabel || pkgDocs.url || null;
    // Some responses nest under packageDocuments[].encodedLabel
    if (!b64 && Array.isArray(piece.packageDocuments)) {
        for (var i = 0; i < piece.packageDocuments.length; i++) {
            if (piece.packageDocuments[i].encodedLabel) {
                b64 = piece.packageDocuments[i].encodedLabel;
                break;
            }
        }
    }

    return {
        trackingNumber: piece.trackingNumber || tx.masterTrackingNumber || null,
        labelPdfBase64: b64,
        raw: data
    };
}

module.exports = {
    getAccessToken: getAccessToken,
    createLabelPdf: createLabelPdf,
    shipFromAddress: shipFromAddress
};
