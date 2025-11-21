# Firebase Admin Seed Data

This document provides instructions and data structures for setting up an **Admin User** in Firestore.

## Automatic Admin Promotion

The application has built-in logic to automatically grant admin rights in the following scenarios:

1.  **First User:** The very first user to register/login to the application (when no other admins exist) is automatically promoted to Admin.
2.  **Hardcoded Email:** The user with the email `beytullahars0@gmail.com` is **always** granted admin rights upon login, regardless of whether other admins exist.

## Manual Admin Creation

If you need to manually create an admin user via the Firebase Console, verify the `users` collection exists under `artifacts/{appId}/users`.

### Collection Path
`artifacts/{appId}/users/{uid}`

(Replace `{appId}` with your `VITE_APP_ID` from environment variables, and `{uid}` with the user's Authentication UID).

### User Document Structure (JSON)

To manually promote a user to admin, ensure their document contains `"isAdmin": true`.

```json
{
  "uid": "USER_UID_HERE",
  "email": "user@example.com",
  "displayName": "Admin User",
  "photoURL": "https://example.com/photo.jpg",
  "createdAt": "TIMESTAMP",
  "lastLogin": "TIMESTAMP",
  "friends": [],
  "rooms": [],
  "roomInvites": [],
  "isAdmin": true
}
```

*Note: The `isAdmin` field is optional for regular users but required (and set to `true`) for admins.*

## CMS Content (Rules, Spells, Weapons)

The CMS content (Rules, Spells, Weapons) is managed via the Admin Dashboard in the application. However, the initial data structure for these collections is as follows:

### Rules Collection
Path: `artifacts/{appId}/rules/{ruleId}`
```json
{
  "id": "adventuring",
  "title": {
    "tr": "Macera",
    "en": "Adventuring"
  },
  "content": {
    "tr": "...",
    "en": "..."
  },
  "category": "core",
  "order": 1
}
```

### Spells Collection
Path: `artifacts/{appId}/spells/{spellId}`
```json
{
  "name": {
    "tr": "Alev Oku",
    "en": "Fire Bolt"
  },
  "level": 0,
  "school": "evocation",
  "castingTime": "1 action",
  "range": "120 feet",
  "components": "V, S",
  "duration": "Instantaneous",
  "description": {
    "tr": "...",
    "en": "..."
  }
}
```

### Weapons Collection
Path: `artifacts/{appId}/weapons/{weaponId}`
```json
{
  "name": {
    "tr": "Hançer",
    "en": "Dagger"
  },
  "type": "simple-melee",
  "damage": "1d4",
  "damageType": "piercing",
  "properties": ["finesse", "light", "thrown"]
}
```
