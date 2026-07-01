export interface GeoFilters {
  name?: string;
  gender?: string[];
  age?: string[];
  role?: string[];
  diagnosis?: string[];
  diagnosisSubType?: string[];
  diagnosisMonth?: number[];
  diagnosisYear?: number[];
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface DateFilterData {
  years: number[];
  months: number[];
}
