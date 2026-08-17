import { SiteContent } from '../types';

export const seedSiteContent: SiteContent = {
  announcementBar: {
    enabled: true,
    message: 'COMPLIMENTARY ARMORED TRANSIT & BIS HALLMARK CERTIFICATION ON ALL RESERVATIONS',
    linkHref: '/care',
    linkLabel: 'Read certification guidelines',
  },
  houseStory: {
    heading: 'Custodians of Imperial Tradition',
    subheading: 'Born from the temple sanctums of Tamil Nadu and the royal courts of Rajasthan.',
    paragraphs: [
      'Adi Parva—named for the first book of the Mahabharata, "the book of beginnings"—was founded on a singular custodial promise: to keep and preserve Indian heritage jewellery in its purest form.',
      'We do not view our creations as commercial products to be sold. We treat every piece as a sacred heirloom to be kept in trust, crafted by hereditary artisan clusters using techniques unchanged since the Chola and Maratha dynasties.',
      'From hand-hammered temple nakashi repoussé in Nagercoil to pure gold foil burnished Kundan in Jaipur, our collection reflects the living soul of Indian craftsmanship.',
    ],
  },
  craftOverview: {
    heading: 'The Six Stages of Royal Craftsmanship',
    steps: [
      { number: 1, title: 'Wax Model & Alloy Casting', description: 'Forming traditional 22K antique gold alloy ratios in charcoal furnaces.' },
      { number: 2, title: 'Nakashi Repoussé Work', description: 'Hand-hammering relief deity panels into pine pitch resin beds.' },
      { number: 3, title: 'Kundan Foil Setting', description: 'Burnishing hyper-pure 24K gold foil around natural uncut gemstones.' },
      { number: 4, title: 'Vitreous Meenakari Enamelling', description: 'Firing mineral oxide glazes in high-temperature kilns.' },
      { number: 5, title: 'Hand Patination & Polish', description: 'Terra-cotta paste hand-buffing to produce heirloom reddish luster.' },
      { number: 6, title: 'BIS Certification & Vaulting', description: 'Assay hallmarking, photo documentation, and silk repository packing.' },
    ],
  },
  careGuide: {
    heading: 'Custodial Jewellery Care Guidelines',
    guidelines: [
      { title: 'Dry Storage', text: 'Store pieces individually in dry mahogany boxes away from humidity and sunlight.' },
      { title: 'No Chemical Exposure', text: 'Avoid contact with perfumes, hairsprays, thermal baths, and liquid cleaners.' },
      { title: 'Microfiber Cleaning', text: 'Wipe metal surfaces with dry cotton microfibers after wearing to remove skin oils.' },
      { title: 'Annual Bench Inspection', text: 'Bring heirlooms to our atelier annually for complimentary silk re-stringing and clasp checks.' },
    ],
  },
};
