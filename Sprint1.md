Sprint 1(SE)

**Team Members**

**FRONTEND:**

*   Devin Wylde
*   Sanya Chaturvedi

**BACKEND:**

*   Fabian Gracia
*   Sahil Dhanani

**USER STORIES**

1.  **As a new user, I want to create an account with a unique username and password so that I can securely store my parting messages.**
    1.  Conversation:
        1.  Should usernames be unique?
        2.  Any restrictions on username formats?
        3.  Any requirements for the password?
    2.  Confirmation:
        1.  System ensures that usernames are unique during registration.
        2.  Username must be between 4-20 characters long and can only contain letters, numbers, and underscores
        3.  If the username is taken, the user is notified.
        4.  Passwords must be at least 8 characters long with a mix of letters, numbers, and special characters.
2.  **As a new user, I want to provide my personal details during registration so that my loved ones can recognize my messages, videos, pictures etc.**
    1.  Conversation:
        1.  Which fields should be mandatory or optional?
        2.  Can users edit their personal details later?
        3.  Can users edit their personal information after registration?
    2.  Confirmation:
        1.  First and last name, email, and a contact verification method are required.
        2.  Names can include alphabets, spaces, and hyphens, with a length of 2-50 characters.
        3.  Users can update their personal information after registration.
3.  **As a user, I want an option to stay logged in, so that I don’t have to enter my credentials every time.**
    1.  Conversation:
        1.  How long should the session remain active?
        2.  Should we securely store session tokens in cookies?
    2.  Confirmation:
        1.  Session tokens are securely stored in encrypted cookies with an expiration time.
        2.  Users can select "Stay logged in" for extended login sessions.
4.  **As a user, I want to be able to reset my password if I forget it, so that I can regain access to my account.**
    1.  Conversation:
        1.  How will users reset their passwords?
        2.  What kind of confirmation will the user receive at each step of the process?
        3.  How long should the reset link remain valid?
        4.  Should users answer security questions if they can not access their emails.
    2.  Confirmation:
        1.  Users request a password reset by entering their registered email.
        2.  System checks for a matching account and provides a reset link.
        3.  Reset links remain valid for a limited time.
        4.  Security questions are prompted for users if they don't have their email.
5.  **As a user, I want to record and upload a farewell message so that my loved ones can receive it after I pass away.**
    1.  Conversation:
        1.  What types of media should be supported (video, audio, text)?
        2.  Should users be able to schedule multiple messages?
    2.  Confirmation:
        1.  Users can record or upload video, audio, and text-based messages.
        2.  Each message is stored securely and linked to intended recipients.
        3.  Users can schedule multiple messages for different loved ones.
        4.  Will users receive feedback after they update their information?
        5.  Are there any character limits for the bio?
        6.  Users can update their profile picture, bio, and personal details
        7.  Users can enter a bio with a defined character limit
        8.  Upon successful update, users receive a confirmation message
6.  **As a user, I want to be notified when I enter incorrect login details so that I can correct my credentials and access my account.**
    1.  Conversation: 
        1.  How should error messages be displayed for clarity?
        2.  Should the message be generic to enhance security?
    2.  Confirmation:
        1.  An error message appears near the login form when incorrect credentials are entered.
        2.  The message remains visible until the user attempts to log in again or successfully logs in.
        3.  The message does not specify whether the username or password is incorrect.
7.  **As a user, I want to make my profile private so that only approved recipients can access my messages and personal information.**
    1.  Conversation: 
        1.  How should users access privacy settings?
        2.  How will approval requests be handled?
        3.  What information should remain hidden when a profile is private?
    2.  Confirmation:
        1.  Users can enable privacy settings in their account settings.
        2.  Approved recipients can request access, which the user can accept or decline.
        3.  Private profiles restrict non-approved users from viewing messages or personal details.
8.  **As a user, I want to follow or unfollow other users so that I can stay connected with those I care about.**
    1.  Conversation:
        1.  How will following impact notifications and message visibility?
        2.  Should private accounts require approval for followers?
        3.  Should users be able to see who follows them?
    2.  Confirmation:
        1.  Users can follow another person with a button that toggles between “Follow” and “Following.”
        2.  Clicking “Unfollow” removes the user from the follower list.
        3.  Private accounts require approval before being followed.
9.  **As a user, I want to receive notifications when I get a message so that I stay updated with conversations.**
    1.  Conversation:
        1.  Should users receive repeat notifications for unread messages?
        2.  Can users mute notifications from specific users?
        3.  Should multiple messages trigger one notification or separate ones?
    2.  Confirmation:
        1.  Users receive notifications when a message is received.
        2.  Message notifications include previews or an alert icon.
        3.  Users can mute notifications for specific users or conversations.
10.  **As a user, I want to send private messages so that I can communicate securely with loved ones.**
    1.  Conversation:
        1.  Should media files be supported?
        2.  Can users see when messages have been read?
        3.  How should messages be encrypted for privacy?
    2.  Confirmation:
        1.  Users can send text and media messages.
        2.  The system displays when a message is read.
        3.  All messages are encrypted for security.
11.  **As a user, I want to create group chats so that I can communicate with multiple loved ones at once.**
    1.  Conversation:
        1.  Should there be a limit on group members?
        2.  Can users add or remove participants?
        3.  Should there be group admins with extra permissions?
    2.  Confirmation:
        1.  Users can create group chats with up to 30 participants.
        2.  Members can be added or removed by the chat creator.
        3.  Group admins can be assigned with special permissions.
12.  **As a user, I want to assign specific recipients to my parting messages so that they are sent to the right people when the time comes.**
    1.  Conversation:
        1.  Should users be able to assign multiple recipients per message?
        2.  Should messages be private or viewable by a designated group?
        3.  What happens if a recipient’s contact details change?
    2.  Confirmation:
        1.  Users can select multiple recipients for a message.
        2.  Messages are stored privately and only sent to designated recipients.
        3.  Users can update recipient details before activation.
13.  **As a user, I want my messages to be sent after a period of inactivity so that my loved ones receive them when I am no longer around.**
    1.  Conversation:
        1.  How will inactivity be determined?
        2.  Should there be multiple verification steps before sending?
    2.  Confirmation:
        1.  Users set an inactivity threshold for message release.
        2.  The system periodically checks for activity and sends prompts for confirmation.
        3.  If no response is received within the set period, messages are automatically delivered.
14.  **As a user, I want to add backup recipients for my messages in case my primary recipient cannot be reached.**
    1.  Conversation:
        1.  Should users be notified if a recipient’s contact details are invalid?
        2.  Should users be able to assign multiple backup recipients?
    2.  Confirmation:
        1.  Users can designate backup recipients.
        2.  If a primary recipient is unreachable, messages are sent to the backup.
15.  **As a user, I want my messages to remain private until they are delivered so that my personal thoughts are secure.**
    1.  Conversation:
        1.  Should messages be encrypted?
        2.  Should users have an option for added security layers?
    2.  Confirmation:
        1.  Messages remain encrypted and secure until delivered.
        2.  Only designated recipients can access the messages.
16.  **As a user, I want to update or remove my messages before they are sent so that I can change or withdraw anything I no longer wish to share.**
    1.  Conversation:
        1.  Should there be a deadline for message edits?
        2.  What happens if a message is edited after a recipient is assigned?
    2.  Confirmation:
        1.  Users can modify or delete their messages anytime before delivery.
        2.  Deleted messages are permanently removed.
17.  **As a user, I want to designate a trusted contact to manage my account after my passing so that my privacy is protected.**
    1.  Conversation:
        1.  How will verification work before granting access?
        2.  Should the trusted contact have full account control?
    2.  Confirmation:
        1.  Users can assign a trusted contact for post-inactivity access.
        2.  Verification is required before access is granted.
18.  **As a user, I want to receive notifications about my account and messages so that I stay informed.**
    1.  Conversation:
        1.  Should notifications be real-time or scheduled?
        2.  Can users customize notification settings?
    2.  Confirmation:
        1.  Users receive notifications for account activity, message updates, and inactivity checks.
        2.  Notification settings are customizable.
19.  **As a user, I want to receive a final reminder before my messages are sent so that I can confirm or delay delivery if needed.**
    1.  Conversation:
        1.  How far in advance should reminders be sent?
        2.  Should users be able to delay message delivery?
    2.  Confirmation:
        1.  A reminder is sent before scheduled message delivery.
        2.  Users can confirm, edit, or delay messages before they are sent.

**User Stories Addressed in Sprint 1**

**User Registration – Unique Username & Secure Password**

*   New users should be able to create an account with a unique username and a secure password to store their parting messages safely.
*   **Acceptance Criteria:**
    *   The system ensures that usernames are unique and correctly formatted.
    *   Passwords must meet complexity requirements.
    *   Clear error messages should be displayed when inputs are invalid.

**2\. Registration – Collecting Personal Details**

*   Users must provide personal details during registration so that their loved ones can recognize their messages.
*   **Acceptance Criteria:**
    *   Required fields: first name, last name, email, and a contact verification method.
    *   Names can contain alphabets, spaces, and hyphens (2-50 characters long).
    *   Users can update their personal details later and receive confirmation upon doing so.

**3\. “Stay Logged In” Feature**

*   Users should have an option to stay logged in to avoid re-entering their credentials repeatedly.
*   **Acceptance Criteria:**
    *   A checkbox for "Stay logged in" on the login screen.
    *   Session tokens stored securely in encrypted cookies with expiration time.
    *   Users who select this option remain logged in as long as the session token is valid.

**4\. Password Reset Functionality**

*   Users should be able to reset their password if they forget it.
*   **Acceptance Criteria:**
    *   Users can request a password reset via their registered email.
    *   The system verifies the email and provides a reset link.
    *   Reset links remain valid for a specific period.
    *   Security questions are available if email access is not possible.

**5\. Farewell Message Recording & Scheduling**

*   Users should be able to record and upload farewell messages for their loved ones.
*   **Acceptance Criteria:**
    *   Users can upload messages in video, audio, and text formats.
    *   Each message is securely stored and linked to designated recipients.
    *   Users can schedule multiple messages for different recipients.

**6\. Assign Specific Recipients for Parting Messages**

*   Users should be able to assign specific recipients to their parting messages.
*   **Acceptance Criteria:**
    *   Users can select multiple recipients.
    *   Messages remain private until sent.
    *   Users can update recipient details before activation.

**7\. Inactivity-Based Message Delivery**

*   Messages should be sent automatically if a user remains inactive for a set period.
*   **Acceptance Criteria:**
    *   Users define an inactivity threshold for message release.
    *   The system checks for activity and prompts for confirmation.
    *   If no response is received, messages are delivered automatically.

**8\. Backup Recipients for Messages**

*   Users should be able to add backup recipients in case primary recipients are unreachable.
*   **Acceptance Criteria:**
    *   Users can designate backup recipients.
    *   If the primary recipient is unavailable, messages are sent to the backup.

Planned Issue for Sprint 1

**Frontend Team**

1.  Implement the registration page with username validation (Issue #1)
2.  Create the login page with "Stay Logged In" functionality (Issue #3)
3.  Design the password reset interface (Issue #4)
4.  Develop the farewell message recording interface (Issue #5)
5.  Implement UI for assigning recipients to messages (Issue #6)

**Backend Team**

1.  Implement user registration logic with unique usernames (Issue #1)
2.  Store and validate user personal details (Issue #2)
3.  Implement "Stay Logged In" feature with secure session tokens (Issue #3)
4.  Implement password reset logic with email verification (Issue #4)
5.  Develop backend storage for farewell messages (Issue #5)
6.  Implement recipient assignment for messages (Issue #6)
7.  Develop inactivity-based message delivery system (Issue #7)
8.  Add support for backup recipients (Issue #8)

Completed Issues

**Frontend Team:**

1.  Registration page with username validation (Issue #1)
2.  Login page with "Stay Logged In" functionality (Issue #3)
3.  Password reset interface (Issue #4)
4.  UI for assigning recipients to messages (Issue #6)

**Backend Team:**

1.  User registration logic with unique username validation (Issue #1)
2.  Secure session token storage for "Stay Logged In" (Issue #3)
3.  Password reset logic with email verification (Issue #4)
4.  Backend storage for farewell messages (Issue #5)
5.  Recipient assignment for messages (Issue #6)

Not Completed Issues

During sprint 1 we set too much of an amibitious agenda by adding more issues than our team could reasonably address within the sprint timeframe. As a result, while we successfully completed issues 1, 3, 4, 5, and 6. The stay logged in feature and password reset functionality features were not implemented or not fully implemented. Although the reset password front end was set up properly. One of the things that left us having some difficulty this sprint 1 was a change from angular to react which caused many backend routes to stop working.