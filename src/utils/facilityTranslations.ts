// Translation map for facility names
export const facilityTranslations: Record<string, string> = {
  furnished: "Nội thất đầy đủ",
  washing_machine: "Máy giặt",
  no_curfew: "Không giờ giấc",
  mezzanine: "Gác lửng",
  fridge: "Tủ lạnh",
  kitchen_shelf: "Tủ bếp",
  aircon: "Điều hòa",
  private_entry: "Cửa riêng",
  elevator: "Thang máy",
  security_24h: "Bảo vệ 24/7",
  garage: "Chỗ để xe",
};

/**
 * Translate facility name from English to Vietnamese
 * @param facilityName - The facility name key in English
 * @returns The translated facility name in Vietnamese
 */
export function translateFacility(facilityName: string): string {
  return facilityTranslations[facilityName] || facilityName;
}
