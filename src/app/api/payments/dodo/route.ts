import { NextResponse } from 'next/server';
import { dodopayments, dodoProductId } from '@/lib/dodoLib';
import { CountryCode } from 'dodopayments/resources/index.mjs';

const client = dodopayments;
const SUPPORTED_COUNTRY_CODES = await client.misc.listSupportedCountries();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Get basic information
    const email = formData.get('email') as string;
    const quantity = formData.get('quantity') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const zipcode = formData.get('zipcode') as string;
    const mapURL = formData.get('mapURL') as string;

    const productId = dodoProductId;
    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const payment = await client.payments.create({
      billing: {
        city: 'Bengaluru',
        country: 'IN' as CountryCode,
        state: 'KA',
        street: '100 Ft Road',
        zipcode: '560075'
      },
      customer: {
        email: email,
        name: email,
        create_new_customer: true,
        phone_number: phone,
      },
      product_cart: [{
        product_id: productId,
        quantity: parseInt(quantity)
      }],
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      metadata: {
        email: email,
        quantity: quantity,
        phone: phone,
        address: address,
        zipcode: zipcode,
        mapURL: mapURL,
      },
      allowed_payment_method_types: ['debit', 'credit', 'upi_collect', 'google_pay', 'cashapp'],
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