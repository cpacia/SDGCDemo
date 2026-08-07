/**
 * Primary navigation, mirrored 1:1 from the live sethdichardgolf.com menu.
 *
 * Only one target is rewritten for the demo: Services → "Golf League &
 * Tournaments" points at our leagues hub ("/") instead of the WordPress anchor.
 */
export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

const SITE = "https://sethdichardgolf.com";

export const NAV: NavItem[] = [
  { label: "Home", href: `${SITE}/` },
  {
    label: "About Us",
    href: `${SITE}/about-us/`,
    children: [
      { label: "Our Instructors", href: `${SITE}/our-instructors/` },
      { label: "Our Staff", href: `${SITE}/our-staff/` },
      { label: "Map & Directions", href: `${SITE}/directions/` },
      { label: "Policies", href: `${SITE}/policies/` },
      { label: "Gallery", href: `${SITE}/sdgc_full_gallery/` },
    ],
  },
  {
    label: "Services",
    href: `${SITE}/services/`,
    children: [
      { label: "Golf Simulators", href: `${SITE}/services#services-golf-simulators` },
      { label: "Golf League & Tournaments", href: "/" },
      { label: "Golf Lessons", href: `${SITE}/services#services-golf-lessons` },
      { label: "Golf Programs", href: `${SITE}/services#services-golf-programs` },
      { label: "Custom Club Fitting", href: `${SITE}/book-now/#book-golf-league-events-services/` },
      { label: "Events & Parties", href: `${SITE}/events-parties/` },
      { label: "Golf Bag Storage", href: `${SITE}/book-now/#book-golf-league-events-services/` },
    ],
  },
  {
    label: "Programs",
    href: "#",
    children: [
      { label: "Program Guidelines", href: `${SITE}/programs/` },
      { label: "SDGC Indoor Junior Programs", href: `${SITE}/sdgc-indoor-junior-programs/` },
      { label: "SDGC Indoor Adult Programs", href: `${SITE}/sdgc-indoor-adult-programs/` },
    ],
  },
  { label: "Contact Us", href: `${SITE}/contact-us/` },
];

export const CONTACT = {
  phone: "(603) 860-9893",
  phoneHref: "tel:+16038609893",
  email: "info@sethdichardgolf.com",
  bookNow: `${SITE}/book-now/`,
  giftCertificates: `${SITE}/gift-certificates/`,
};
