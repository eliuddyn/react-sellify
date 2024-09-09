/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import { Client, Databases, ID } from 'node-appwrite';
import { Stripe } from 'stripe'
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async ({ req, res, log, error }) => {

  if (req.path === '/create_customer') {

    if (req.method === 'OPTIONS') {
      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    }

    if (req.method === 'POST') {
      try {
        const newCustomer = await stripe.customers.create({
          name: req.body.customerName,
          email: req.body.customerEmail,
        })

        return res.json({ stripeCustomerID: newCustomer?.id }, 200, {
          'Access-Control-Allow-Origin': '*',
        })
      } catch (error) {
        log(error)
        return res.json({ error: error.message }, 500, {
          'Access-Control-Allow-Origin': '*',
        })
      }
    }
  }

  if (req.path === '/create_product') {

    if (req.method === 'OPTIONS') {
      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    }

    if (req.method === 'POST') {

      try {
        const newProduct = await stripe.products.create({
          name: req.body.productName,
          description: req.body.productDescription,
          images: [req.body.productImage],
          default_price_data: {
            unit_amount: req.body.productPrice * 100,
            currency: 'dop',
          },
          expand: ['default_price'],
        })

        return res.json({ stripeProductID: newProduct?.id, stripePriceID: newProduct?.default_price?.id }, 200, {
          'Access-Control-Allow-Origin': '*',
        })
      } catch (error) {
        log(error)
        return res.json({ error: error.message }, 500, {
          'Access-Control-Allow-Origin': '*',
        })
      }
    }
  }

  if (req.path === '/update_product') {

    if (req.method === 'OPTIONS') {

      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    }

    if (req.method === 'POST') {

      let theProductUpdated
      let theNewPrice
      let theProductName
      let theProductDescription
      let theProductPrice
      let theProductImage

      if (req.body.productName) {
        theProductName = { name: req.body.productName }
      }

      if (req.body.productDescription) {
        theProductDescription = { description: req.body.productDescription }
      }

      if (req.body.productImage) {
        theProductImage = { images: [req.body.productImage] }
      }

      if (req.body.productPrice) {
        theProductPrice = {
          unit_amount: req.body.productPrice * 100,
          currency: 'dop',
        }
      }

      try {

        if (req.body.productPrice) {

          // Creating the new price
          theNewPrice = await stripe.prices.create({
            product: req.body.productId,
            ...theProductPrice
          })
        }

        theProductUpdated = await stripe.products.update(
          req.body.productId,
          {
            ...theProductName,
            ...theProductDescription,
            ...theProductImage,
            default_price: theNewPrice?.id,
          })

        if (req.body.productPrice) {

          // Archiving the old price
          await stripe.prices.update(
            req.body.priceId,
            {
              active: false
            })
        }

        return res.json({ newPriceId: theNewPrice?.id }, 200, {
          'Access-Control-Allow-Origin': '*',
        })
      } catch (error) {
        return res.json({ error: error.message }, 500, {
          'Access-Control-Allow-Origin': '*',
        })
      }
    }
  }

  if (req.path === '/checkout') {

    if (req.method === 'OPTIONS') {

      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    }

    if (req.method === 'POST') {

      /** @type {import('stripe').Stripe.Checkout.SessionCreateParams.LineItem} */

      let lineItems = []

      try {

        const {
          success_url,
          failure_url,
          customerEmail,
          products,
          customerID,
          customerName,
          //stripeCustomerID,
          cartItems,
          shippingTotal,
          subTotal,
          totalAmount,
          orderNumber,
          orderDate,
          changesInDbAfterPurchase
        } = req.body;

        await products?.forEach((product) => {

          const myData = {
            price: product?.productPriceStripeID,
            quantity: product?.productQuantity,
          }

          lineItems.push(myData)
        });

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          //customer: stripeCustomerID,
          success_url: success_url,
          cancel_url: failure_url,
          customer_email: customerEmail,
          invoice_creation: {
            enabled: true,
            invoice_data: {
              metadata: {
                orderCustomerID: customerID,
                orderCartItems: cartItems,
                orderShippingTotal: shippingTotal,
                orderSubTotal: subTotal,
                orderTotalAmount: totalAmount,
                orderNumber: orderNumber,
                orderDate: orderDate,
                changesInDbAfterPurchase: changesInDbAfterPurchase,
                emailCustomerName: customerName,
                emailCustomer: customerEmail
              }
            }
          },
          shipping_options: [
            {
              shipping_rate: 'shr_1PpdKoGeNEvQgy3Vbh0PXemE',
            },
          ],
          line_items: lineItems,
        });

        return res.json(session, 200, {
          'Access-Control-Allow-Origin': '*',
        })
      } catch (error) {
        return res.json({ error: error.message, lineItems: lineItems }, 500, {
          'Access-Control-Allow-Origin': '*',
        })
      }
    }
  }

  if (req.path === '/webhook') {

    if (req.method === 'OPTIONS') {
      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    }

    if (req.method === 'POST') {
      const event = req.body

      if (event.type === 'invoice.payment_succeeded') {

        // Appwrite client
        const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setKey(process.env.APPWRITE_SECRET_KEY);

        // Resend Initialization
        const resend = new Resend(process.env.RESEND_API_KEY);

        const databases = new Databases(client);
        const paymentIntent = event?.data?.object

        const myOrderToPurchase = {
          customer: paymentIntent?.metadata?.orderCustomerID,
          cartItems: paymentIntent?.metadata?.orderCartItems?.split(','),
          shippingTotal: Number(paymentIntent?.metadata?.orderShippingTotal),
          subTotal: Number(paymentIntent?.metadata?.orderSubTotal),
          totalAmount: Number(paymentIntent?.metadata?.orderTotalAmount),
          orderNumber: paymentIntent?.metadata?.orderNumber,
          invoice_pdf_url: paymentIntent?.invoice_pdf,
          orderDate: paymentIntent?.metadata?.orderDate
        }

        // To convert the JSON string to an array of objects
        let obj = eval('(' + paymentIntent?.metadata?.changesInDbAfterPurchase + ')');
        let theResultArray = [];

        for (let i in obj) {
          theResultArray.push(obj[i]);
        }

        try {

          if (myOrderToPurchase?.cartItems?.length > 0) {
            await databases.createDocument(
              process.env.DATABASE_ID,
              process.env.COLLECTION_ID_ORDERS,
              ID.unique(),
              myOrderToPurchase
            )

            theResultArray.forEach(async (purchase) => {
              await databases.updateDocument(
                process.env.DATABASE_ID,
                process.env.COLLECTION_ID_CART_ITEMS,
                purchase?.cartItemID,
                { purchased: 'YES' }
              )

              await databases.updateDocument(
                process.env.DATABASE_ID,
                process.env.COLLECTION_ID_PRODUCTS,
                purchase?.productID,
                { quantity: purchase?.newProductQuantity, sales: purchase?.newProductSales }
              )
            });

            try {

              // Send receive email to the customer
              await resend.emails.send({
                from: 'Somos J. Center <sellify@eliuddy.dev>',
                to: [`${paymentIntent?.metadata?.emailCustomer}`],
                subject: 'Somos J. Center - Tu orden',
                html: `
                <h3>Hola ${paymentIntent?.metadata?.emailCustomerName}...</h3>
                <p>Gracias por comprar en Somos J. Center. En este correo podrás descargar el recibo de tu compra.</p>

                <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td style="padding: 12px 18px 12px 18px; border-radius:5px; background-color: #2563eb;" align="center">
                                    <a rel="noopener" href="${paymentIntent?.invoice_pdf}" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block;" target="_blank">Descargar recibo</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                `
              });

            } catch (error) {
              error(error);
              return res.json({ error }, 500, {
                'Access-Control-Allow-Origin': '*',
              })
            }
          }

        } catch (error) {
          return res.json({ error: error.message }, 500, {
            'Access-Control-Allow-Origin': '*',
          })
        }
      }

      return res.json({ 'paymentIntent': event?.data?.object }, 200, {
        'Access-Control-Allow-Origin': '*',
      })
    }
  }

};
