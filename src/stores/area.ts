import { defineStore } from 'pinia';

interface AreaState {
  selectedRegion: string;
  selectedCityName: string;
}

export const useAreaStore = defineStore('area', {
  state: (): AreaState => ({
    selectedRegion: 'china',
    selectedCityName: '',
  }),
  actions: {
    setSelectedRegion(region: string, cityName: string = '') {
      console.log(region,cityName);
      this.selectedRegion = region;
      this.selectedCityName = cityName;
    },
  },
});