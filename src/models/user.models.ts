import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  // Basic Info
  phone_number: string;
  email?: string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  first_name_kana?: string;
  last_name_kana?: string;
  birthday?: Date;
  age?: number; // Calculated field
  gender?: 'male' | 'female' | 'other';
  
  // Profile
  avatar?: string; // File path/URL to avatar image
  gallery?: string[]; // Array of file paths/URLs to gallery images
  bio?: string;
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
    city?: string;
    prefecture?: string;
  };
  
  // Social Features
  interests?: string[];
  tags?: string[];
  relationshipStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  marriageIntention?: boolean;
  immediateAvailability?: boolean;
  
  // Category Selection (Required for registration)
  categories?: {
    friendship?: boolean;    // 友達作り恋活
    hobby?: boolean;         // 趣味で交流
    consultation?: boolean;  // 相談
  };
  
  // Verification & Safety
  isVerified: boolean;
  isBlocked: boolean;
  reportCount: number;
  lastActiveAt: Date;
  onlineStatus: 'online' | 'offline' | 'away';
  
  // Preferences
  preferences?: {
    ageRange?: { min: number; max: number };
    distance?: number; // km
    interests?: string[];
    gender?: string[];
  };
  
  // Stats
  profileViews: number;
  heartCount: number;
  favoriteCount: number;
  
  // Authentication
  phoneVerified: boolean;
  verificationAttempts: number;
  lastVerificationAttempt?: Date;
  
  // Identity Verification
  identityVerification?: {
    documentType: string; // Type of document (passport, driver's license, etc.)
    frontImage: string; // File path to front image
    backImage: string; // File path to back image
    status: 'pending' | 'approved' | 'rejected'; // Verification status
    submittedAt: Date; // When documents were submitted
    reviewedAt?: Date; // When documents were reviewed
    rejectionReason?: string; // Reason for rejection if applicable
  };
  
  // Additional Profile Information
  zodiac?: string;
  bloodType?: string;
  bodyType?: string;
  height?: string;
  weight?: string;
  selfType?: string;
  income?: string;
  smoke?: string;
  alcohol?: string;
  talkTime?: string;
  children?: string;
  marriageHistory?: string;
  desiredPartnerBodyType?: string;
  desiredPartnerType?: string;
  playArea?: string;
  dateWant?: string;
  datePlace?: string;
  partnerAge?: string;
  
  // Comprehensive Profile Preferences (友達作り恋活 - Friendship/Dating)
  friendshipDatingProfile?: {
    // 性別 (Gender)
    gender_male?: boolean;
    gender_female?: boolean;
    gender_other?: boolean;
    
    // 血液型 (Blood Type)
    bloodType_a?: boolean;
    bloodType_b?: boolean;
    bloodType_o?: boolean;
    bloodType_ab?: boolean;
    
    // よく遊ぶ場所 (Frequent Hangout Spots) - Text field
    playArea?: string;
    
    // 体型 (Body Type)
    bodyType_slim?: boolean;
    bodyType_normal?: boolean;
    bodyType_athletic?: boolean;
    bodyType_chubby?: boolean;
    bodyType_other?: boolean;
    
    // 身長 (Height)
    height_150_155?: boolean;
    height_156_160?: boolean;
    height_161_165?: boolean;
    height_166_170?: boolean;
    height_171_175?: boolean;
    height_176_180?: boolean;
    height_181_185?: boolean;
    height_186_190?: boolean;
    height_191_195?: boolean;
    height_196_200?: boolean;
    height_201_205?: boolean;
    height_206_210?: boolean;
    height_211_215?: boolean;
    height_216_220?: boolean;
    height_221_225?: boolean;
    height_226_230?: boolean;
    height_231_235?: boolean;
    height_236_240?: boolean;
    height_241_245?: boolean;
    height_246_250?: boolean;
    height_251_255?: boolean;
    height_256_260?: boolean;
    height_261_265?: boolean;
    height_266_270?: boolean;
    height_271_275?: boolean;
    height_276_280?: boolean;
    height_281_285?: boolean;
    height_286_290?: boolean;
    height_291_295?: boolean;
    height_296_300?: boolean;
    
    // 体重 (Weight)
    weight_40_45?: boolean;
    weight_46_50?: boolean;
    weight_51_55?: boolean;
    weight_56_60?: boolean;
    weight_61_65?: boolean;
    weight_66_70?: boolean;
    weight_71_75?: boolean;
    weight_76_80?: boolean;
    weight_81_85?: boolean;
    weight_86_90?: boolean;
    weight_91_95?: boolean;
    weight_96_100?: boolean;
    weight_101_105?: boolean;
    weight_106_110?: boolean;
    weight_111_115?: boolean;
    weight_116_120?: boolean;
    weight_121_125?: boolean;
    weight_126_130?: boolean;
    weight_131_135?: boolean;
    weight_136_140?: boolean;
    weight_141_145?: boolean;
    weight_146_150?: boolean;
    weight_151_155?: boolean;
    weight_156_160?: boolean;
    weight_161_165?: boolean;
    weight_166_170?: boolean;
    weight_171_175?: boolean;
    weight_176_180?: boolean;
    weight_181_185?: boolean;
    weight_186_190?: boolean;
    weight_191_195?: boolean;
    weight_196_200?: boolean;
    
    // 自分のタイプ (Your Type)
    selfType_bright?: boolean;
    selfType_serious?: boolean;
    selfType_cool?: boolean;
    selfType_kind?: boolean;
    selfType_funny?: boolean;
    selfType_mature?: boolean;
    selfType_cute?: boolean;
    selfType_sexy?: boolean;
    selfType_leader?: boolean;
    selfType_shy?: boolean;
    selfType_joker?: boolean;
    
    // デートでしたいこと (Things you want to do on a date) - Text field
    dateWant?: string;
    
    // デートで行きたいところ (Places you want to go on a date) - Text field
    datePlace?: string;
    
    // 年収 (Annual Income)
    income_under_3m?: boolean;
    income_3m_5m?: boolean;
    income_5m_7m?: boolean;
    income_7m_10m?: boolean;
    income_10m_15m?: boolean;
    income_15m_20m?: boolean;
    income_20m_30m?: boolean;
    income_30m_50m?: boolean;
    income_over_50m?: boolean;
    
    // たばこ (Smoking)
    smoke_no?: boolean;
    smoke_yes?: boolean;
    smoke_sometimes?: boolean;
    
    // お酒 (Alcohol)
    alcohol_no?: boolean;
    alcohol_sometimes?: boolean;
    alcohol_daily?: boolean;
    
    // 話せる時間 (Available time to talk)
    talkTime_anytime?: boolean;
    talkTime_morning?: boolean;
    talkTime_afternoon?: boolean;
    talkTime_evening?: boolean;
    talkTime_late_night?: boolean;
    talkTime_holiday?: boolean;
    
    // 学歴 (Education)
    education_high_school?: boolean;
    education_vocational?: boolean;
    education_university?: boolean;
    education_graduate?: boolean;
    
    // 職業 (Occupation)
    occupation_office_worker?: boolean;
    occupation_civil_servant?: boolean;
    occupation_self_employed?: boolean;
    occupation_student?: boolean;
    occupation_housewife?: boolean;
    occupation_other?: boolean;
    
    // 希望する相手のタイプ (Desired partner type)
    desiredPartnerType_bright?: boolean;
    desiredPartnerType_serious?: boolean;
    desiredPartnerType_cool?: boolean;
    desiredPartnerType_kind?: boolean;
    desiredPartnerType_funny?: boolean;
    desiredPartnerType_mature?: boolean;
    desiredPartnerType_cute?: boolean;
    desiredPartnerType_sexy?: boolean;
    desiredPartnerType_leader?: boolean;
    desiredPartnerType_shy?: boolean;
    desiredPartnerType_joker?: boolean;
  };
  
  // Hobby Exchange Profile (趣味で交流)
  hobbyExchangeProfile?: {
    // Sports
    hobby_soccer?: boolean;
    hobby_tennis?: boolean;
    hobby_golf?: boolean;
    hobby_badminton?: boolean;
    hobby_volleyball?: boolean;
    hobby_basketball?: boolean;
    hobby_table_tennis?: boolean;
    hobby_walking?: boolean;
    hobby_jogging?: boolean;
    hobby_cycling?: boolean;
    hobby_skiing?: boolean;
    hobby_snowboarding?: boolean;
    hobby_weight_training?: boolean;
    hobby_yoga?: boolean;
    hobby_pilates?: boolean;
    hobby_dance?: boolean;
    hobby_swimming?: boolean;
    hobby_mountain_climbing?: boolean;
    
    // Outdoor/Leisure
    hobby_camping?: boolean;
    hobby_fishing?: boolean;
    hobby_driving?: boolean;
    hobby_travel?: boolean;
    
    // Arts/Culture/Entertainment
    hobby_movies?: boolean;
    hobby_music?: boolean;
    hobby_reading?: boolean;
    hobby_anime?: boolean;
    hobby_manga?: boolean;
    hobby_games?: boolean;
    hobby_cooking?: boolean;
    hobby_gourmet?: boolean;
    hobby_cafe_hopping?: boolean;
    hobby_photography?: boolean;
    hobby_camera?: boolean;
    hobby_fashion?: boolean;
    hobby_beauty?: boolean;
    hobby_nail_art?: boolean;
    hobby_art?: boolean;
    hobby_language_learning?: boolean;
    
    // Lifestyle/Other
    hobby_investing?: boolean;
    hobby_volunteer?: boolean;
    hobby_pets?: boolean;
    hobby_gardening?: boolean;
    hobby_diy?: boolean;
    hobby_fortune_telling?: boolean;
    hobby_meditation?: boolean;
    hobby_hot_springs?: boolean;
    hobby_sauna?: boolean;
    
    // Social/Nightlife
    hobby_karaoke?: boolean;
    hobby_darts?: boolean;
    hobby_billiards?: boolean;
    hobby_mahjong?: boolean;
    hobby_shogi?: boolean;
    hobby_go?: boolean;
    hobby_horse_racing?: boolean;
    hobby_pachinko?: boolean;
    hobby_slot_machines?: boolean;
    hobby_gambling?: boolean;
    hobby_drinking_parties?: boolean;
    hobby_offline_meetups?: boolean;
    hobby_events?: boolean;
    hobby_live_music?: boolean;
    hobby_festivals?: boolean;
    
    // Experiences
    hobby_sports_watching?: boolean;
    hobby_theater?: boolean;
    hobby_art_museum?: boolean;
    hobby_museum?: boolean;
    hobby_zoo?: boolean;
    hobby_aquarium?: boolean;
    hobby_amusement_park?: boolean;
    hobby_theme_park?: boolean;
    hobby_city_walking?: boolean;
    hobby_shopping?: boolean;
    hobby_food_tours?: boolean;
    hobby_bar_hopping?: boolean;
    hobby_all_you_can_eat?: boolean;
    hobby_all_you_can_drink?: boolean;
    
    // Food Types
    hobby_ramen?: boolean;
    hobby_sushi?: boolean;
    hobby_yakiniku?: boolean;
    
    // Dining/Drinking Establishments
    hobby_izakaya?: boolean;
    hobby_bar?: boolean;
    hobby_club?: boolean;
    hobby_lounge?: boolean;
    hobby_cabaret_club?: boolean;
    hobby_host_club?: boolean;
    hobby_adult_entertainment?: boolean;
    
    // General
    hobby_other?: boolean;
  };
  
  // Fortune-telling Consultation Profile (占い相談)
  fortuneTellingProfile?: {
    // 占いの方法 (Fortune-telling methods)
    fortune_method_palmistry?: boolean;
    fortune_method_tarot?: boolean;
    fortune_method_name_judgment?: boolean;
    fortune_method_four_pillars?: boolean;
    fortune_method_sanmeigaku?: boolean;
    fortune_method_nine_star_ki?: boolean;
    fortune_method_sukuyou_astrology?: boolean;
    fortune_method_western_astrology?: boolean;
    fortune_method_eastern_astrology?: boolean;
    fortune_method_iching?: boolean;
    fortune_method_feng_shui?: boolean;
    fortune_method_dream_interpretation?: boolean;
    fortune_method_spiritual_vision?: boolean;
    fortune_method_healing?: boolean;
    fortune_method_other?: boolean;
    
    // 相談ジャンル (Consultation genres)
    consultation_genre_love?: boolean;
    consultation_genre_marriage?: boolean;
    consultation_genre_reconciliation?: boolean;
    consultation_genre_affair?: boolean;
    consultation_genre_work?: boolean;
    consultation_genre_human_relationships?: boolean;
    consultation_genre_family?: boolean;
    consultation_genre_health?: boolean;
    consultation_genre_money_luck?: boolean;
    consultation_genre_fortune?: boolean;
    consultation_genre_job_change?: boolean;
    consultation_genre_good_luck?: boolean;
    consultation_genre_other?: boolean;
    
    // 相談できるタレント (Available consultation methods)
    consultation_method_chat?: boolean;
    consultation_method_phone?: boolean;
    consultation_method_video?: boolean;
    consultation_method_in_person?: boolean;
    consultation_method_email?: boolean;
    consultation_method_other?: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>({
  // Basic Info
  phone_number: { 
    type: String, 
    unique: true, 
    required: true,
    index: true 
  },
  email: { type: String },
  nickname: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  first_name_kana: { type: String },
  last_name_kana: { type: String },
  birthday: { type: Date },
  age: { type: Number },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  
  // Profile
  avatar: { type: String }, // File path/URL to avatar image
  gallery: [{ type: String }], // Array of file paths/URLs to gallery images
  bio: { type: String, default: '' },
  location: {
    coordinates: { type: [Number] },
    city: { type: String },
    prefecture: { type: String }
  },
  
  // Social Features
  interests: [{ type: String }],
  tags: [{ type: String }],
  relationshipStatus: { 
    type: String, 
    enum: ['single', 'married', 'divorced', 'widowed'] 
  },
  marriageIntention: { type: Boolean, default: false },
  immediateAvailability: { type: Boolean, default: false },
  
  // Category Selection (Required for registration)
  categories: {
    friendship: { type: Boolean, default: false },    // 友達作り恋活
    hobby: { type: Boolean, default: false },         // 趣味で交流
    consultation: { type: Boolean, default: false }   // 相談
  },
  
  // Verification & Safety
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now },
  onlineStatus: { 
    type: String, 
    enum: ['online', 'offline', 'away'], 
    default: 'offline' 
  },
  
  // Preferences
  preferences: {
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 65 }
    },
    distance: { type: Number, default: 50 },
    interests: [{ type: String }],
    gender: [{ type: String }]
  },
  
  // Stats
  profileViews: { type: Number, default: 0 },
  heartCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  
  // Authentication
  phoneVerified: { type: Boolean, default: false },
  verificationAttempts: { type: Number, default: 0 },
  lastVerificationAttempt: { type: Date },
  
  // Identity Verification
  identityVerification: {
    documentType: { type: String },
    frontImage: { type: String },
    backImage: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    rejectionReason: { type: String }
  },
  
  // Additional Profile Information
  zodiac: { type: String },
  bloodType: { type: String },
  bodyType: { type: String },
  height: { type: String },
  weight: { type: String },
  selfType: { type: String },
  income: { type: String },
  smoke: { type: String },
  alcohol: { type: String },
  talkTime: { type: String },
  children: { type: String },
  marriageHistory: { type: String },
  desiredPartnerBodyType: { type: String },
  desiredPartnerType: { type: String },
  playArea: { type: String },
  dateWant: { type: String },
  datePlace: { type: String },
  partnerAge: { type: String },
  
  // Comprehensive Profile Preferences (友達作り恋活 - Friendship/Dating)
  friendshipDatingProfile: {
    // 性別 (Gender)
    gender_male: { type: Boolean, default: false },
    gender_female: { type: Boolean, default: false },
    gender_other: { type: Boolean, default: false },
    
    // 血液型 (Blood Type)
    bloodType_a: { type: Boolean, default: false },
    bloodType_b: { type: Boolean, default: false },
    bloodType_o: { type: Boolean, default: false },
    bloodType_ab: { type: Boolean, default: false },
    
    // よく遊ぶ場所 (Frequent Hangout Spots) - Text field
    playArea: { type: String, default: '' },
    
    // 体型 (Body Type)
    bodyType_slim: { type: Boolean, default: false },
    bodyType_normal: { type: Boolean, default: false },
    bodyType_athletic: { type: Boolean, default: false },
    bodyType_chubby: { type: Boolean, default: false },
    bodyType_other: { type: Boolean, default: false },
    
    // 身長 (Height)
    height_150_155: { type: Boolean, default: false },
    height_156_160: { type: Boolean, default: false },
    height_161_165: { type: Boolean, default: false },
    height_166_170: { type: Boolean, default: false },
    height_171_175: { type: Boolean, default: false },
    height_176_180: { type: Boolean, default: false },
    height_181_185: { type: Boolean, default: false },
    height_186_190: { type: Boolean, default: false },
    height_191_195: { type: Boolean, default: false },
    height_196_200: { type: Boolean, default: false },
    height_201_205: { type: Boolean, default: false },
    height_206_210: { type: Boolean, default: false },
    height_211_215: { type: Boolean, default: false },
    height_216_220: { type: Boolean, default: false },
    height_221_225: { type: Boolean, default: false },
    height_226_230: { type: Boolean, default: false },
    height_231_235: { type: Boolean, default: false },
    height_236_240: { type: Boolean, default: false },
    height_241_245: { type: Boolean, default: false },
    height_246_250: { type: Boolean, default: false },
    height_251_255: { type: Boolean, default: false },
    height_256_260: { type: Boolean, default: false },
    height_261_265: { type: Boolean, default: false },
    height_266_270: { type: Boolean, default: false },
    height_271_275: { type: Boolean, default: false },
    height_276_280: { type: Boolean, default: false },
    height_281_285: { type: Boolean, default: false },
    height_286_290: { type: Boolean, default: false },
    height_291_295: { type: Boolean, default: false },
    height_296_300: { type: Boolean, default: false },
    
    // 体重 (Weight)
    weight_40_45: { type: Boolean, default: false },
    weight_46_50: { type: Boolean, default: false },
    weight_51_55: { type: Boolean, default: false },
    weight_56_60: { type: Boolean, default: false },
    weight_61_65: { type: Boolean, default: false },
    weight_66_70: { type: Boolean, default: false },
    weight_71_75: { type: Boolean, default: false },
    weight_76_80: { type: Boolean, default: false },
    weight_81_85: { type: Boolean, default: false },
    weight_86_90: { type: Boolean, default: false },
    weight_91_95: { type: Boolean, default: false },
    weight_96_100: { type: Boolean, default: false },
    weight_101_105: { type: Boolean, default: false },
    weight_106_110: { type: Boolean, default: false },
    weight_111_115: { type: Boolean, default: false },
    weight_116_120: { type: Boolean, default: false },
    weight_121_125: { type: Boolean, default: false },
    weight_126_130: { type: Boolean, default: false },
    weight_131_135: { type: Boolean, default: false },
    weight_136_140: { type: Boolean, default: false },
    weight_141_145: { type: Boolean, default: false },
    weight_146_150: { type: Boolean, default: false },
    weight_151_155: { type: Boolean, default: false },
    weight_156_160: { type: Boolean, default: false },
    weight_161_165: { type: Boolean, default: false },
    weight_166_170: { type: Boolean, default: false },
    weight_171_175: { type: Boolean, default: false },
    weight_176_180: { type: Boolean, default: false },
    weight_181_185: { type: Boolean, default: false },
    weight_186_190: { type: Boolean, default: false },
    weight_191_195: { type: Boolean, default: false },
    weight_196_200: { type: Boolean, default: false },
    
    // 自分のタイプ (Your Type)
    selfType_bright: { type: Boolean, default: false },
    selfType_serious: { type: Boolean, default: false },
    selfType_cool: { type: Boolean, default: false },
    selfType_kind: { type: Boolean, default: false },
    selfType_funny: { type: Boolean, default: false },
    selfType_mature: { type: Boolean, default: false },
    selfType_cute: { type: Boolean, default: false },
    selfType_sexy: { type: Boolean, default: false },
    selfType_leader: { type: Boolean, default: false },
    selfType_shy: { type: Boolean, default: false },
    selfType_joker: { type: Boolean, default: false },
    
    // デートでしたいこと (Things you want to do on a date) - Text field
    dateWant: { type: String, default: '' },
    
    // デートで行きたいところ (Places you want to go on a date) - Text field
    datePlace: { type: String, default: '' },
    
    // 年収 (Annual Income)
    income_under_3m: { type: Boolean, default: false },
    income_3m_5m: { type: Boolean, default: false },
    income_5m_7m: { type: Boolean, default: false },
    income_7m_10m: { type: Boolean, default: false },
    income_10m_15m: { type: Boolean, default: false },
    income_15m_20m: { type: Boolean, default: false },
    income_20m_30m: { type: Boolean, default: false },
    income_30m_50m: { type: Boolean, default: false },
    income_over_50m: { type: Boolean, default: false },
    
    // たばこ (Smoking)
    smoke_no: { type: Boolean, default: false },
    smoke_yes: { type: Boolean, default: false },
    smoke_sometimes: { type: Boolean, default: false },
    
    // お酒 (Alcohol)
    alcohol_no: { type: Boolean, default: false },
    alcohol_sometimes: { type: Boolean, default: false },
    alcohol_daily: { type: Boolean, default: false },
    
    // 話せる時間 (Available time to talk)
    talkTime_anytime: { type: Boolean, default: false },
    talkTime_morning: { type: Boolean, default: false },
    talkTime_afternoon: { type: Boolean, default: false },
    talkTime_evening: { type: Boolean, default: false },
    talkTime_late_night: { type: Boolean, default: false },
    talkTime_holiday: { type: Boolean, default: false },
    
    // 学歴 (Education)
    education_high_school: { type: Boolean, default: false },
    education_vocational: { type: Boolean, default: false },
    education_university: { type: Boolean, default: false },
    education_graduate: { type: Boolean, default: false },
    
    // 職業 (Occupation)
    occupation_office_worker: { type: Boolean, default: false },
    occupation_civil_servant: { type: Boolean, default: false },
    occupation_self_employed: { type: Boolean, default: false },
    occupation_student: { type: Boolean, default: false },
    occupation_housewife: { type: Boolean, default: false },
    occupation_other: { type: Boolean, default: false },
    
    // 希望する相手のタイプ (Desired partner type)
    desiredPartnerType_bright: { type: Boolean, default: false },
    desiredPartnerType_serious: { type: Boolean, default: false },
    desiredPartnerType_cool: { type: Boolean, default: false },
    desiredPartnerType_kind: { type: Boolean, default: false },
    desiredPartnerType_funny: { type: Boolean, default: false },
    desiredPartnerType_mature: { type: Boolean, default: false },
    desiredPartnerType_cute: { type: Boolean, default: false },
    desiredPartnerType_sexy: { type: Boolean, default: false },
    desiredPartnerType_leader: { type: Boolean, default: false },
    desiredPartnerType_shy: { type: Boolean, default: false },
    desiredPartnerType_joker: { type: Boolean, default: false }
  },
  
  // Hobby Exchange Profile (趣味で交流)
  hobbyExchangeProfile: {
    // Sports
    hobby_soccer: { type: Boolean, default: false },
    hobby_tennis: { type: Boolean, default: false },
    hobby_golf: { type: Boolean, default: false },
    hobby_badminton: { type: Boolean, default: false },
    hobby_volleyball: { type: Boolean, default: false },
    hobby_basketball: { type: Boolean, default: false },
    hobby_table_tennis: { type: Boolean, default: false },
    hobby_walking: { type: Boolean, default: false },
    hobby_jogging: { type: Boolean, default: false },
    hobby_cycling: { type: Boolean, default: false },
    hobby_skiing: { type: Boolean, default: false },
    hobby_snowboarding: { type: Boolean, default: false },
    hobby_weight_training: { type: Boolean, default: false },
    hobby_yoga: { type: Boolean, default: false },
    hobby_pilates: { type: Boolean, default: false },
    hobby_dance: { type: Boolean, default: false },
    hobby_swimming: { type: Boolean, default: false },
    hobby_mountain_climbing: { type: Boolean, default: false },
    
    // Outdoor/Leisure
    hobby_camping: { type: Boolean, default: false },
    hobby_fishing: { type: Boolean, default: false },
    hobby_driving: { type: Boolean, default: false },
    hobby_travel: { type: Boolean, default: false },
    
    // Arts/Culture/Entertainment
    hobby_movies: { type: Boolean, default: false },
    hobby_music: { type: Boolean, default: false },
    hobby_reading: { type: Boolean, default: false },
    hobby_anime: { type: Boolean, default: false },
    hobby_manga: { type: Boolean, default: false },
    hobby_games: { type: Boolean, default: false },
    hobby_cooking: { type: Boolean, default: false },
    hobby_gourmet: { type: Boolean, default: false },
    hobby_cafe_hopping: { type: Boolean, default: false },
    hobby_photography: { type: Boolean, default: false },
    hobby_camera: { type: Boolean, default: false },
    hobby_fashion: { type: Boolean, default: false },
    hobby_beauty: { type: Boolean, default: false },
    hobby_nail_art: { type: Boolean, default: false },
    hobby_art: { type: Boolean, default: false },
    hobby_language_learning: { type: Boolean, default: false },
    
    // Lifestyle/Other
    hobby_investing: { type: Boolean, default: false },
    hobby_volunteer: { type: Boolean, default: false },
    hobby_pets: { type: Boolean, default: false },
    hobby_gardening: { type: Boolean, default: false },
    hobby_diy: { type: Boolean, default: false },
    hobby_fortune_telling: { type: Boolean, default: false },
    hobby_meditation: { type: Boolean, default: false },
    hobby_hot_springs: { type: Boolean, default: false },
    hobby_sauna: { type: Boolean, default: false },
    
    // Social/Nightlife
    hobby_karaoke: { type: Boolean, default: false },
    hobby_darts: { type: Boolean, default: false },
    hobby_billiards: { type: Boolean, default: false },
    hobby_mahjong: { type: Boolean, default: false },
    hobby_shogi: { type: Boolean, default: false },
    hobby_go: { type: Boolean, default: false },
    hobby_horse_racing: { type: Boolean, default: false },
    hobby_pachinko: { type: Boolean, default: false },
    hobby_slot_machines: { type: Boolean, default: false },
    hobby_gambling: { type: Boolean, default: false },
    hobby_drinking_parties: { type: Boolean, default: false },
    hobby_offline_meetups: { type: Boolean, default: false },
    hobby_events: { type: Boolean, default: false },
    hobby_live_music: { type: Boolean, default: false },
    hobby_festivals: { type: Boolean, default: false },
    
    // Experiences
    hobby_sports_watching: { type: Boolean, default: false },
    hobby_theater: { type: Boolean, default: false },
    hobby_art_museum: { type: Boolean, default: false },
    hobby_museum: { type: Boolean, default: false },
    hobby_zoo: { type: Boolean, default: false },
    hobby_aquarium: { type: Boolean, default: false },
    hobby_amusement_park: { type: Boolean, default: false },
    hobby_theme_park: { type: Boolean, default: false },
    hobby_city_walking: { type: Boolean, default: false },
    hobby_shopping: { type: Boolean, default: false },
    hobby_food_tours: { type: Boolean, default: false },
    hobby_bar_hopping: { type: Boolean, default: false },
    hobby_all_you_can_eat: { type: Boolean, default: false },
    hobby_all_you_can_drink: { type: Boolean, default: false },
    
    // Food Types
    hobby_ramen: { type: Boolean, default: false },
    hobby_sushi: { type: Boolean, default: false },
    hobby_yakiniku: { type: Boolean, default: false },
    
    // Dining/Drinking Establishments
    hobby_izakaya: { type: Boolean, default: false },
    hobby_bar: { type: Boolean, default: false },
    hobby_club: { type: Boolean, default: false },
    hobby_lounge: { type: Boolean, default: false },
    hobby_cabaret_club: { type: Boolean, default: false },
    hobby_host_club: { type: Boolean, default: false },
    hobby_adult_entertainment: { type: Boolean, default: false },
    
    // General
    hobby_other: { type: Boolean, default: false }
  },
  
  // Fortune-telling Consultation Profile (占い相談)
  fortuneTellingProfile: {
    // 占いの方法 (Fortune-telling methods)
    fortune_method_palmistry: { type: Boolean, default: false },
    fortune_method_tarot: { type: Boolean, default: false },
    fortune_method_name_judgment: { type: Boolean, default: false },
    fortune_method_four_pillars: { type: Boolean, default: false },
    fortune_method_sanmeigaku: { type: Boolean, default: false },
    fortune_method_nine_star_ki: { type: Boolean, default: false },
    fortune_method_sukuyou_astrology: { type: Boolean, default: false },
    fortune_method_western_astrology: { type: Boolean, default: false },
    fortune_method_eastern_astrology: { type: Boolean, default: false },
    fortune_method_iching: { type: Boolean, default: false },
    fortune_method_feng_shui: { type: Boolean, default: false },
    fortune_method_dream_interpretation: { type: Boolean, default: false },
    fortune_method_spiritual_vision: { type: Boolean, default: false },
    fortune_method_healing: { type: Boolean, default: false },
    fortune_method_other: { type: Boolean, default: false },
    
    // 相談ジャンル (Consultation genres)
    consultation_genre_love: { type: Boolean, default: false },
    consultation_genre_marriage: { type: Boolean, default: false },
    consultation_genre_reconciliation: { type: Boolean, default: false },
    consultation_genre_affair: { type: Boolean, default: false },
    consultation_genre_work: { type: Boolean, default: false },
    consultation_genre_human_relationships: { type: Boolean, default: false },
    consultation_genre_family: { type: Boolean, default: false },
    consultation_genre_health: { type: Boolean, default: false },
    consultation_genre_money_luck: { type: Boolean, default: false },
    consultation_genre_fortune: { type: Boolean, default: false },
    consultation_genre_job_change: { type: Boolean, default: false },
    consultation_genre_good_luck: { type: Boolean, default: false },
    consultation_genre_other: { type: Boolean, default: false },
    
    // 相談できるタレント (Available consultation methods)
    consultation_method_chat: { type: Boolean, default: false },
    consultation_method_phone: { type: Boolean, default: false },
    consultation_method_video: { type: Boolean, default: false },
    consultation_method_in_person: { type: Boolean, default: false },
    consultation_method_email: { type: Boolean, default: false },
    consultation_method_other: { type: Boolean, default: false }
  },
  
  lastLoginAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ onlineStatus: 1, lastActiveAt: -1 });
UserSchema.index({ age: 1, gender: 1 });
UserSchema.index({ phoneVerified: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
