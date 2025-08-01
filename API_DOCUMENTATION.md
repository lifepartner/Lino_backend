# Lino API Documentation

## Overview

This document describes the MongoDB database structure and API endpoints for the Lino application, specifically focusing on the comprehensive profile management system that handles user preferences for three main categories:

1. **友達作り恋活 (Friendship/Dating)** - `friendshipDatingProfile`
2. **趣味で交流 (Hobby Exchange)** - `hobbyExchangeProfile` 
3. **占い相談 (Fortune-telling Consultation)** - `fortuneTellingProfile`

## Database Design Philosophy

The database is designed following MongoDB's non-relational characteristics:

- **Boolean Fields**: Each selectable option is stored as a boolean value (`true`/`false`)
- **Embedded Documents**: Profile data is stored as embedded documents within the user document
- **Flexible Schema**: New options can be easily added without schema migrations
- **Efficient Queries**: Boolean fields allow for fast filtering and matching

## User Model Structure

### Core User Fields
```typescript
{
  _id: ObjectId,
  phone_number: string,           // Primary identifier
  email: string,
  nickname: string,
  first_name: string,
  last_name: string,
  birthday: Date,
  age: number,
  gender: 'male' | 'female' | 'other',
  avatar: string,
  // ... other basic fields
}
```

### Profile Categories
```typescript
{
  categories: {
    friendship: boolean,    // 友達作り恋活
    hobby: boolean,         // 趣味で交流
    consultation: boolean   // 占い相談
  }
}
```

## 1. Friendship/Dating Profile (友達作り恋活)

### Database Structure
```typescript
friendshipDatingProfile: {
  // 性別 (Gender)
  gender_male: boolean,
  gender_female: boolean,
  gender_other: boolean,
  
  // 血液型 (Blood Type)
  bloodType_a: boolean,
  bloodType_b: boolean,
  bloodType_o: boolean,
  bloodType_ab: boolean,
  
  // よく遊ぶ場所 (Frequent Hangout Spots) - Text field
  playArea: string,
  
  // 体型 (Body Type)
  bodyType_slim: boolean,
  bodyType_normal: boolean,
  bodyType_athletic: boolean,
  bodyType_chubby: boolean,
  bodyType_other: boolean,
  
  // 身長 (Height) - 30 ranges from 150cm to 300cm
  height_150_155: boolean,
  height_156_160: boolean,
  // ... (all height ranges)
  height_296_300: boolean,
  
  // 体重 (Weight) - 32 ranges from 40kg to 200kg
  weight_40_45: boolean,
  weight_46_50: boolean,
  // ... (all weight ranges)
  weight_196_200: boolean,
  
  // 自分のタイプ (Your Type)
  selfType_bright: boolean,
  selfType_serious: boolean,
  selfType_cool: boolean,
  selfType_kind: boolean,
  selfType_funny: boolean,
  selfType_mature: boolean,
  selfType_cute: boolean,
  selfType_sexy: boolean,
  selfType_leader: boolean,
  selfType_shy: boolean,
  selfType_joker: boolean,
  
  // デートでしたいこと (Things you want to do on a date) - Text field
  dateWant: string,
  
  // デートで行きたいところ (Places you want to go on a date) - Text field
  datePlace: string,
  
  // 年収 (Annual Income)
  income_under_3m: boolean,
  income_3m_5m: boolean,
  income_5m_7m: boolean,
  income_7m_10m: boolean,
  income_10m_15m: boolean,
  income_15m_20m: boolean,
  income_20m_30m: boolean,
  income_30m_50m: boolean,
  income_over_50m: boolean,
  
  // たばこ (Smoking)
  smoke_no: boolean,
  smoke_yes: boolean,
  smoke_sometimes: boolean,
  
  // お酒 (Alcohol)
  alcohol_no: boolean,
  alcohol_sometimes: boolean,
  alcohol_daily: boolean,
  
  // 話せる時間 (Available time to talk)
  talkTime_anytime: boolean,
  talkTime_morning: boolean,
  talkTime_afternoon: boolean,
  talkTime_evening: boolean,
  talkTime_late_night: boolean,
  talkTime_holiday: boolean,
  
  // 学歴 (Education)
  education_high_school: boolean,
  education_vocational: boolean,
  education_university: boolean,
  education_graduate: boolean,
  
  // 職業 (Occupation)
  occupation_office_worker: boolean,
  occupation_civil_servant: boolean,
  occupation_self_employed: boolean,
  occupation_student: boolean,
  occupation_housewife: boolean,
  occupation_other: boolean,
  
  // 希望する相手のタイプ (Desired partner type)
  desiredPartnerType_bright: boolean,
  desiredPartnerType_serious: boolean,
  desiredPartnerType_cool: boolean,
  desiredPartnerType_kind: boolean,
  desiredPartnerType_funny: boolean,
  desiredPartnerType_mature: boolean,
  desiredPartnerType_cute: boolean,
  desiredPartnerType_sexy: boolean,
  desiredPartnerType_leader: boolean,
  desiredPartnerType_shy: boolean,
  desiredPartnerType_joker: boolean
}
```

### API Endpoints

#### Update Friendship/Dating Profile
```http
POST /api/users/friendship-dating-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "gender_male": true,
  "gender_female": false,
  "gender_other": false,
  "bloodType_a": true,
  "bloodType_b": false,
  "bloodType_o": false,
  "bloodType_ab": false,
  "playArea": "渋谷、新宿",
  "bodyType_slim": true,
  "bodyType_normal": false,
  "height_160_165": true,
  "weight_50_55": true,
  "selfType_bright": true,
  "selfType_kind": true,
  "dateWant": "映画を見て、おいしいご飯を食べる",
  "datePlace": "渋谷のカフェ",
  "income_5m_7m": true,
  "smoke_no": true,
  "alcohol_sometimes": true,
  "talkTime_evening": true,
  "education_university": true,
  "occupation_office_worker": true,
  "desiredPartnerType_kind": true,
  "desiredPartnerType_funny": true
}
```

#### Get Friendship/Dating Profile
```http
GET /api/users/friendship-dating-profile
Authorization: Bearer <token>
```

## 2. Hobby Exchange Profile (趣味で交流)

### Database Structure
```typescript
hobbyExchangeProfile: {
  // Sports
  hobby_soccer: boolean,
  hobby_tennis: boolean,
  hobby_golf: boolean,
  hobby_badminton: boolean,
  hobby_volleyball: boolean,
  hobby_basketball: boolean,
  hobby_table_tennis: boolean,
  hobby_walking: boolean,
  hobby_jogging: boolean,
  hobby_cycling: boolean,
  hobby_skiing: boolean,
  hobby_snowboarding: boolean,
  hobby_weight_training: boolean,
  hobby_yoga: boolean,
  hobby_pilates: boolean,
  hobby_dance: boolean,
  hobby_swimming: boolean,
  hobby_mountain_climbing: boolean,
  
  // Outdoor/Leisure
  hobby_camping: boolean,
  hobby_fishing: boolean,
  hobby_driving: boolean,
  hobby_travel: boolean,
  
  // Arts/Culture/Entertainment
  hobby_movies: boolean,
  hobby_music: boolean,
  hobby_reading: boolean,
  hobby_anime: boolean,
  hobby_manga: boolean,
  hobby_games: boolean,
  hobby_cooking: boolean,
  hobby_gourmet: boolean,
  hobby_cafe_hopping: boolean,
  hobby_photography: boolean,
  hobby_camera: boolean,
  hobby_fashion: boolean,
  hobby_beauty: boolean,
  hobby_nail_art: boolean,
  hobby_art: boolean,
  hobby_language_learning: boolean,
  
  // Lifestyle/Other
  hobby_investing: boolean,
  hobby_volunteer: boolean,
  hobby_pets: boolean,
  hobby_gardening: boolean,
  hobby_diy: boolean,
  hobby_fortune_telling: boolean,
  hobby_meditation: boolean,
  hobby_hot_springs: boolean,
  hobby_sauna: boolean,
  
  // Social/Nightlife
  hobby_karaoke: boolean,
  hobby_darts: boolean,
  hobby_billiards: boolean,
  hobby_mahjong: boolean,
  hobby_shogi: boolean,
  hobby_go: boolean,
  hobby_horse_racing: boolean,
  hobby_pachinko: boolean,
  hobby_slot_machines: boolean,
  hobby_gambling: boolean,
  hobby_drinking_parties: boolean,
  hobby_offline_meetups: boolean,
  hobby_events: boolean,
  hobby_live_music: boolean,
  hobby_festivals: boolean,
  
  // Experiences
  hobby_sports_watching: boolean,
  hobby_theater: boolean,
  hobby_art_museum: boolean,
  hobby_museum: boolean,
  hobby_zoo: boolean,
  hobby_aquarium: boolean,
  hobby_amusement_park: boolean,
  hobby_theme_park: boolean,
  hobby_city_walking: boolean,
  hobby_shopping: boolean,
  hobby_food_tours: boolean,
  hobby_bar_hopping: boolean,
  hobby_all_you_can_eat: boolean,
  hobby_all_you_can_drink: boolean,
  
  // Food Types
  hobby_ramen: boolean,
  hobby_sushi: boolean,
  hobby_yakiniku: boolean,
  
  // Dining/Drinking Establishments
  hobby_izakaya: boolean,
  hobby_bar: boolean,
  hobby_club: boolean,
  hobby_lounge: boolean,
  hobby_cabaret_club: boolean,
  hobby_host_club: boolean,
  hobby_adult_entertainment: boolean,
  
  // General
  hobby_other: boolean
}
```

### API Endpoints

#### Update Hobby Exchange Profile
```http
POST /api/users/hobby-exchange-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "hobby_soccer": true,
  "hobby_tennis": false,
  "hobby_movies": true,
  "hobby_music": true,
  "hobby_cooking": true,
  "hobby_travel": true,
  "hobby_cafe_hopping": true,
  "hobby_photography": false,
  "hobby_karaoke": true,
  "hobby_shopping": true,
  "hobby_ramen": true,
  "hobby_sushi": true,
  "hobby_izakaya": true
}
```

#### Get Hobby Exchange Profile
```http
GET /api/users/hobby-exchange-profile
Authorization: Bearer <token>
```

## 3. Fortune-telling Consultation Profile (占い相談)

### Database Structure
```typescript
fortuneTellingProfile: {
  // 占いの方法 (Fortune-telling methods)
  fortune_method_palmistry: boolean,
  fortune_method_tarot: boolean,
  fortune_method_name_judgment: boolean,
  fortune_method_four_pillars: boolean,
  fortune_method_sanmeigaku: boolean,
  fortune_method_nine_star_ki: boolean,
  fortune_method_sukuyou_astrology: boolean,
  fortune_method_western_astrology: boolean,
  fortune_method_eastern_astrology: boolean,
  fortune_method_iching: boolean,
  fortune_method_feng_shui: boolean,
  fortune_method_dream_interpretation: boolean,
  fortune_method_spiritual_vision: boolean,
  fortune_method_healing: boolean,
  fortune_method_other: boolean,
  
  // 相談ジャンル (Consultation genres)
  consultation_genre_love: boolean,
  consultation_genre_marriage: boolean,
  consultation_genre_reconciliation: boolean,
  consultation_genre_affair: boolean,
  consultation_genre_work: boolean,
  consultation_genre_human_relationships: boolean,
  consultation_genre_family: boolean,
  consultation_genre_health: boolean,
  consultation_genre_money_luck: boolean,
  consultation_genre_fortune: boolean,
  consultation_genre_job_change: boolean,
  consultation_genre_good_luck: boolean,
  consultation_genre_other: boolean,
  
  // 相談できるタレント (Available consultation methods)
  consultation_method_chat: boolean,
  consultation_method_phone: boolean,
  consultation_method_video: boolean,
  consultation_method_in_person: boolean,
  consultation_method_email: boolean,
  consultation_method_other: boolean
}
```

### API Endpoints

#### Update Fortune-telling Profile
```http
POST /api/users/fortune-telling-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fortune_method_tarot": true,
  "fortune_method_western_astrology": true,
  "consultation_genre_love": true,
  "consultation_genre_work": true,
  "consultation_genre_fortune": true,
  "consultation_method_chat": true,
  "consultation_method_video": true
}
```

#### Get Fortune-telling Profile
```http
GET /api/users/fortune-telling-profile
Authorization: Bearer <token>
```

## Usage Examples

### Frontend Implementation

#### React Native Example
```typescript
// Update friendship/dating profile
const updateFriendshipProfile = async (profileData: any) => {
  try {
    const response = await fetch('/api/users/friendship-dating-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    console.log('Profile updated:', result);
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

// Get current profile
const getFriendshipProfile = async () => {
  try {
    const response = await fetch('/api/users/friendship-dating-profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.profile;
  } catch (error) {
    console.error('Error getting profile:', error);
  }
};
```

### Database Queries

#### Find Users with Matching Hobbies
```javascript
// Find users who like soccer and movies
db.users.find({
  "hobbyExchangeProfile.hobby_soccer": true,
  "hobbyExchangeProfile.hobby_movies": true
});
```

#### Find Users with Similar Dating Preferences
```javascript
// Find users with similar income range and smoking preferences
db.users.find({
  "friendshipDatingProfile.income_5m_7m": true,
  "friendshipDatingProfile.smoke_no": true
});
```

#### Find Fortune-telling Consultants
```javascript
// Find users who offer tarot readings for love consultations
db.users.find({
  "fortuneTellingProfile.fortune_method_tarot": true,
  "fortuneTellingProfile.consultation_genre_love": true
});
```

## Response Format

All profile endpoints return responses in this format:

### Success Response
```json
{
  "message": "プロフィールが正常に更新されました",
  "profile": {
    // All profile fields with current values
  }
}
```

### Error Response
```json
{
  "message": "エラーメッセージ",
  "code": "error_code"
}
```

## Best Practices

1. **Partial Updates**: Only send the fields you want to update
2. **Boolean Values**: Always use `true`/`false` for selections
3. **Text Fields**: Use empty strings `""` for unset text fields
4. **Authentication**: Always include the Bearer token in requests
5. **Error Handling**: Check for error codes in responses

## Database Indexes

For optimal performance, the following indexes are recommended:

```javascript
// Index for hobby matching
db.users.createIndex({ "hobbyExchangeProfile.hobby_soccer": 1, "hobbyExchangeProfile.hobby_movies": 1 });

// Index for dating preferences
db.users.createIndex({ "friendshipDatingProfile.income_5m_7m": 1, "friendshipDatingProfile.smoke_no": 1 });

// Index for fortune-telling services
db.users.createIndex({ "fortuneTellingProfile.fortune_method_tarot": 1, "fortuneTellingProfile.consultation_genre_love": 1 });
```

This database design allows for efficient matching and filtering while maintaining the flexibility of MongoDB's document structure. 