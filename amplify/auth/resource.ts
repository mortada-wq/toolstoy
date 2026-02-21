import { defineAuth } from '@aws-amplify/backend';

/**
 * Toolstoy Auth — Cognito User Pool
 * Email + password. Name required. Store URL optional.
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    fullname: {
      mutable: true,
      required: true,
    },
    'custom:store_url': {
      dataType: 'String',
      mutable: true,
      maxLen: 500,
    },
  },
});
