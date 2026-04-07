# Committee Management Page - API Integration Guide

This document outlines all the API placeholder functions in `CommitteeManagementPage.js` that you need to replace with actual API implementations.

## API Placeholder Functions

### 1. **fetchCommittees(filters = [])**
**Location:** Line ~186

**Purpose:** Fetch all committees from the backend

**Current Implementation:** Placeholder that logs and returns empty object

**Expected Response:** 
```javascript
{
  committees: [
    {
      id: "string",
      nameEn: "string",
      nameBn: "string",
      description: "string",
      status: "ACTIVE|INACTIVE"
    }
  ],
  total: number
}
```

**To Replace:** 
Use your actual API call, e.g.:
```javascript
dispatch(fetchWorkforceCommittees(filters))
```

---

### 2. **fetchAvailableUsers()**
**Location:** Line ~203

**Purpose:** Fetch all users who can be mapped to committees

**Expected Response:**
```javascript
[
  {
    id: "string",
    loginName: "string",
    lastNameEn: "string",
    lastNameBn: "string"
  }
]
```

**To Replace:**
```javascript
dispatch(fetchWorkforceInteractiveUsers([]))
  .then(response => response?.payload?.data?.workforceInteractiveUsers || [])
```

---

### 3. **addCommittee(committeeData)**
**Location:** Line ~220

**Purpose:** Create a new committee

**Input Parameter:**
```javascript
{
  nameEn: "string",
  nameBn: "string",
  description: "string",
  status: "ACTIVE"
}
```

**Expected Response:**
```javascript
{
  success: true,
  id: "generated-committee-id"
}
```

**To Replace:**
```javascript
dispatch(createWorkforceCommittee(committeeData, 'createWorkforceCommittee'))
```

---

### 4. **updateCommittee(committeeId, committeeData)**
**Location:** Line ~237

**Purpose:** Update an existing committee

**Input Parameters:**
- `committeeId`: The ID of the committee to update
- `committeeData`: Same structure as `addCommittee`

**Expected Response:**
```javascript
{
  success: true
}
```

**To Replace:**
```javascript
dispatch(updateWorkforceCommittee({ id: committeeId, ...committeeData }))
```

---

### 5. **deleteCommittee(committeeId)**
**Location:** Line ~254

**Purpose:** Delete a committee

**Input Parameter:**
- `committeeId`: The ID of the committee to delete

**Expected Response:**
```javascript
{
  success: true
}
```

**To Replace:**
```javascript
dispatch(deleteWorkforceCommittee({ id: committeeId }))
```

---

### 6. **fetchCommitteeMappings(filters = [])**
**Location:** Line ~271

**Purpose:** Fetch all user-committee mappings

**Expected Response:**
```javascript
[
  {
    id: "string",
    committee: {
      id: "string",
      nameEn: "string",
      nameBn: "string"
    },
    user: {
      id: "string",
      loginName: "string",
      lastNameEn: "string",
      lastNameBn: "string"
    },
    role: "Member|Head" // Optional
  }
]
```

**To Replace:**
```javascript
dispatch(fetchWorkforceCommitteeMappings(filters))
  .then(response => response?.payload?.data?.workforceCommitteeMappings?.edges || [])
```

---

### 7. **mapUserToCommittee(committeeId, userId)**
**Location:** Line ~288

**Purpose:** Create a mapping between a user and a committee

**Input Parameters:**
- `committeeId`: The ID of the committee
- `userId`: The ID of the user to map

**Expected Response:**
```javascript
{
  success: true,
  mappingId: "generated-id"
}
```

**To Replace:**
```javascript
dispatch(createWorkforceCommitteeUserMap({ committeeId, userId }, 'createWorkforceCommitteeUserMap'))
```

---

### 8. **deleteCommitteeMapping(mappingId)**
**Location:** Line ~305

**Purpose:** Delete a user-committee mapping

**Input Parameter:**
- `mappingId`: The ID of the mapping to delete

**Expected Response:**
```javascript
{
  success: true
}
```

**To Replace:**
```javascript
dispatch(deleteWorkforceCommitteeUserMap({ id: mappingId }, 'deleteWorkforceCommitteeUserMap'))
```

---

## Implementation Checklist

- [ ] Create `fetchWorkforceCommittees` action in `src/actions.js`
- [ ] Create `fetchWorkforceInteractiveUsers` action (may already exist)
- [ ] Create `createWorkforceCommittee` action in `src/actions.js`
- [ ] Create `updateWorkforceCommittee` action in `src/actions.js`
- [ ] Create `deleteWorkforceCommittee` action in `src/actions.js`
- [ ] Create `fetchWorkforceCommitteeMappings` action in `src/actions.js`
- [ ] Create `createWorkforceCommitteeUserMap` action in `src/actions.js`
- [ ] Create `deleteWorkforceCommitteeUserMap` action in `src/actions.js`
- [ ] Add corresponding format functions to `src/utils/format_gql.js`
- [ ] Update all placeholder functions in `CommitteeManagementPage.js`

## Notes

1. **Error Handling:** All functions include try-catch blocks and alert users on failure
2. **Success Messages:** Success alerts automatically dismiss after 3 seconds
3. **Data Refresh:** After each operation, `loadData()` is called to refresh all data
4. **Multilingual Support:** All text supports both English and Bangla based on locale
5. **Form Validation:** Dialogs prevent submission without required fields
6. **Confirmation:** Destructive operations (delete) require user confirmation first

## UI Features Already Implemented

- ✅ Add committee with dialog form
- ✅ Edit committee details
- ✅ Delete committee with confirmation
- ✅ List all commits with status indicator
- ✅ Map users to committees
- ✅ View all mappings in table
- ✅ Delete mappings
- ✅ Empty states when no data
- ✅ Bilingual support (English/Bangla)
- ✅ Material-UI styling
- ✅ Success/error notifications
- ✅ Form validation
- ✅ Loading states
