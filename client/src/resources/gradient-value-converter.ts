import { parseColorString } from "@microsoft/fast-components";
import { darkenViaLAB, lightenViaLAB } from "@microsoft/fast-colors";

export class GradientValueConverter {
  public toView(hue: string): string {
    try {
      const color = parseColorString(hue);
      const dark = darkenViaLAB(color, 2);
      const light = lightenViaLAB(color, 2);
      return `linear-gradient(135deg, ${dark.toStringWebRGBA()} 0%, ${light.toStringWebRGBA()} 100%);`;
    } catch (error) {
      return GradientValueConverter.gradient(hue);
    }
  }

  // https://gradienthunt.com
  // https://uigradients.com/
  public static gradient(hue: string): string {
    //if (hue === 'yellow') return 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(255,200,124,1) 0.1%, rgba(252,251,121,1) 90% );';
    if (hue === 'yellow') return 'radial-gradient( circle 468px at 63.8% 80.2%,  rgba(231,246,56,1) 0%, rgba(232,186,52,1) 100.2% );';
    if (hue === 'lightgreen') return 'linear-gradient( 109.6deg,  rgba(17,151,147,1) 11.2%, rgba(154,214,212,1) 55.4%, rgba(255,233,171,1) 100.2% );';
    if (hue === 'drakgreen') return 'radial-gradient( circle 759px at 14% 22.3%,  rgba(10,64,88,1) 0%, rgba(15,164,102,1) 90% );';
    if (hue === 'orange') return 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(230,115,1,0.68) 21.4%, rgba(255,78,78,1) 80.3% );';
    if (hue === 'blue') return 'linear-gradient( 111.8deg,  rgba(0,104,155,1) 19.8%, rgba(0,173,239,1) 92.1% );';
    if (hue === 'violet') return 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(64,84,178,1) 0%, rgba(219,2,234,1) 90% );';
    if (hue === 'red') return 'radial-gradient( circle farthest-corner at 0.2% 0%,  rgba(238,9,121,1) 0%, rgba(255,106,0,1) 100.2% );';
    if (hue === 'turquoise') return 'linear-gradient(to right, #136a8a, #267871);';
    return GradientValueConverter.gradient('turquoise');
  }
}
