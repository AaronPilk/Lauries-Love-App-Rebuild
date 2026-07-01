export default function AmplifyErrors(type: string) {
  switch (type) {
    case 'UsernameExistsException':
      return 'The user already exists';
    case 'CodeMismatchException':
      return 'Incorrect Code. Try again';
    case 'UserNotFoundException':
      return 'User not found';
    case 'UserNotConfirmedException':
      return 'You need to verify your account';
    case 'NotAuthorizedException':
      return 'Incorrect username or password';
    case 'LimitExceededException':
      return 'Your attempts limit has been exceeded. Please try again later';
    case 'TooManyFailedAttemptsException':
      return 'Too many failed attempts. Wait.';
    case 'InvalidPasswordException':
      return 'Invalid password. Follow policy.';
    case 'PasswordResetRequiredException':
      return 'Password reset required. Check email.';
    case 'ExpiredCodeException':
      return 'Confirmation code expired. Resend code.';
    case 'InvalidParameterException':
      return 'Invalid input. Check credentials.';
    case 'TooManyRequestsException':
      return 'Request limit reached. Wait and retry.';
    default:
      return 'Server error, try it again in a couple of minutes';
  }
}
