import { NextResponse } from 'next/server';
import { dodopayments, dodoVegProductId, dodoNonVegProductId } from '@/lib/dodoLib';
import { CountryCode } from 'dodopayments/resources/index.mjs';

const client = dodopayments;
const SUPPORTED_COUNTRY_CODES = await client.misc.listSupportedCountries();

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Get basic information
        const email = formData.get('email') as string;
        const zipCode = formData.get('zipCode') as string;
        const phone = formData.get('phone') as string;
        const mapUrl = formData.get('mapUrl') as string;
        const address = formData.get('address') as string;
        const nonVegQuantity = formData.get('nonVegQuantity') as string;
        const vegQuantity = formData.get('vegQuantity') as string;
        const countryCode = formData.get('countryCode') as string;

        // Default to 'IN' if country code is not supported
        const validCountryCode = SUPPORTED_COUNTRY_CODES.includes(countryCode as CountryCode) ? countryCode : ('IN' as CountryCode);



        if (!dodoNonVegProductId || !dodoVegProductId) {
            return NextResponse.json(
                { error: 'Invalid product IDs' },
                { status: 400 }
            );
        }

        let productCart = [];

        if (parseInt(nonVegQuantity) > 0) {
            productCart.push({
                product_id: dodoNonVegProductId,
                quantity: parseInt(nonVegQuantity)
            });
        }

        if (parseInt(vegQuantity) > 0) {
            productCart.push({
                product_id: dodoVegProductId,
                quantity: parseInt(vegQuantity)
            });
        }

        const payment = await client.payments.create({
            billing: {
                city: 'Bangalore',
                country: validCountryCode as CountryCode,
                state: 'KA',
                street: address,
                zipcode: zipCode
            },
            customer: {
                email: email,
                name: "Ramen Guy",
                create_new_customer: true,
            },
            product_cart: productCart,
            payment_link: true,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmed`,
            metadata: {
                email: email,
                map: mapUrl,
                phone: phone,
                address: address,
                zipCode: zipCode,
                countryCode: countryCode,
                nonVegQuantity: nonVegQuantity,
                vegQuantity: vegQuantity,
            },
        });

        return NextResponse.json({
            clientSecret: payment.client_secret,
            paymentLink: payment.payment_link,
            paymentId: payment.payment_id
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Payment creation failed' },
            { status: 500 }
        );
    }
} 