

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const aws = require('aws-sdk');
const SES = new aws.SES();
exports.handler = async (event) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const info = record.dynamodb.NewImage;
      const time = new Date(parseInt(info.time.N));
      const appLength = info.type.S === '90' ? '90 Minutes' : '1 Hour';
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [info.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'New massage appointment created' },
            Body: {
              Text: {
                Data: `Client: ${info.client.S}\n
            Time: ${time.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Length: ${appLength}\n
            Additional notes: ${info.note.S || 'None'}
            ` },
            },
          },
        })
        .promise()
      await delay(2000)
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'New massage appointment created' },
            Body: {
              Text: {
                Data: `Client: ${info.client.S}\n
            Time: ${time.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Length: ${appLength}\n
            Additional notes: ${info.note.S || 'None'}
            ` },
            },
          },
        })
        .promise()
    } else if (record.eventName === 'MODIFY') {
      const info = record.dynamodb.NewImage;
      const time = new Date(parseInt(info.time.N));
      const appLength = info.type.S === '90' ? '90 Minutes' : '1 Hour';
      const oldInfo = record.dynamodb.OldImage;
      const oldTime = new Date(parseInt(oldInfo.time.N));
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [info.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment updated' },
            Body: {
              Text: {
                Data: `Client: ${info.client.S}\n
            Previous Time: ${oldTime.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Updated time: ${time.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Length: ${appLength}\n
            Additional notes: ${info.note.S || 'None'}
            ` },
            },
          },
        })
        .promise()
        await delay(2000)
        await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment updated' },
            Body: {
              Text: {
                Data: `Client: ${info.client.S}\n
            Previous Time: ${oldTime.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Updated time: ${time.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            Length: ${appLength}\n
            Additional notes: ${info.note.S || 'None'}
            ` },
            },
          },
        })
        .promise()
    } else if (record.eventName === 'REMOVE') {
      const oldInfo = record.dynamodb.OldImage;
      const oldTime = new Date(parseInt(oldInfo.time.N));
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [oldInfo.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment cancelled' },
            Body: {
              Text: {
                Data: `Client: ${oldInfo.client.S}\n
            Previous Time: ${oldTime.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            ` },
            },
          },
        })
        await delay(2000)
        await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment cancelled' },
            Body: {
              Text: {
                Data: `Client: ${oldInfo.client.S}\n
            Previous Time: ${oldTime.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\n
            ` },
            },
          },
        })
    }

  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
