const request = require('supertest');

const { probot, models } = require('.');
const fixtures = require('../fixtures');

describe('Actions', async () => {
  beforeEach(async () => {
    const { SlackWorkspace, SlackUser } = models;
    const workspace = await SlackWorkspace.create({
      slackId: 'T000A',
      accessToken: 'xoxa-token',
    });
    await SlackUser.create({
      slackId: 'U88HS',
      slackWorkspaceId: workspace.id,
    });
  });
  test('When an action\'s name is "cancel", then it is immediately deleted', async () => {
    await request(probot.server).post('/slack/actions').send({
      payload: JSON.stringify(fixtures.slack.action.cancel()),
    })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchSnapshot();
      });
  });

  test('An unknown callback_id returns a 500', async () => {
    probot.logger.level('fatal');
    await request(probot.server).post('/slack/actions').send({
      payload: JSON.stringify({
        token: process.env.SLACK_VERIFICATION_TOKEN,
        callback_id: 'some-random-thing',
        actions: [
          {
            name: 'something',
            type: 'button',
            value: '',
          },
        ],
        team: {
          id: 'T000A',
          domain: 'example',
        },
        user: {
          id: 'U88HS',
          name: 'aaron',
        },
      }),
    })
      .expect(500);
  });
});
