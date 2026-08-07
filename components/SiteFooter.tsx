import { CONTACT } from "@/lib/nav";

const SITE = "https://sethdichardgolf.com";

const SITE_LINKS = [
  { label: "Home", href: `${SITE}/` },
  { label: "About Us", href: `${SITE}/about-us/` },
  { label: "Services", href: `${SITE}/services/` },
  { label: "Programs", href: `${SITE}/programs/` },
  { label: "Support", href: `${SITE}/support/` },
  { label: "Sign a Waiver", href: "https://www.waiverfile.com/b/SethDichardGolfSchools" },
  { label: "Policies", href: `${SITE}/policies/` },
  { label: "Putt-Rite.com", href: "https://putt-rite.com/" },
  { label: "Contact Us", href: "https://putt-rite.com/contact-us/" },
];

const SERVICES = [
  "Golf Simulators",
  "Indoor Golf Leagues",
  "Private Golf Instruction",
  "Semi-Private Instruction",
  "Adult & Junior Programs",
  "Group Classes",
  "Events & Tournaments",
  "Facility Rentals",
  "Private Parties",
  "Book Now!",
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="pb-[10px] font-sans text-[16px] leading-none font-medium text-[#ff0000]">
      {children}
    </h5>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sdgc-link transition-opacity duration-300 hover:opacity-70"
    >
      {children}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-black">
      <div className="mx-auto w-[85%] max-w-[1080px] py-[54px] lg:w-[80%]">
        <div className="grid grid-cols-1 gap-x-[5.5%] gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Site Links */}
          <div className="font-sans text-[14px] leading-none text-white/70">
            <FooterHeading>Site Links</FooterHeading>
            <ul className="space-y-[14px]">
              {SITE_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div className="font-sans text-[14px] leading-none text-white/70">
            <FooterHeading>Our Services</FooterHeading>
            <ul className="space-y-[14px]">
              {SERVICES.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          {/* Contact Us + Recent Posts */}
          <div className="font-sans text-[14px] leading-none text-white/70">
            <FooterHeading>Contact Us</FooterHeading>
            <ul className="space-y-[14px]">
              <li>{CONTACT.phone}</li>
              <li>
                <FooterLink href={`mailto:${CONTACT.email}`}>{CONTACT.email}</FooterLink>
              </li>
              <li className="leading-[1.6]">
                Seth Dichard Golf Centers
                <br />
                28 Lowell Road
                <br />
                Hudson, NH 03051
              </li>
            </ul>

            <div className="mt-9">
              <FooterHeading>Recent Posts</FooterHeading>
              <p className="leading-[1.7]">Rated Top 25 Instructors in MA &amp; NH.</p>
            </div>
          </div>

          {/* About Us */}
          <div className="font-sans text-[14px] text-white/70">
            <FooterHeading>About Us</FooterHeading>
            <p className="leading-[1.7]">
              We&rsquo;re passionate about the success of our students. Meeting your goals with
              complete satisfaction inspires pride and remains crucial to us, here at our Golf
              Center.
            </p>
          </div>
        </div>

        {/* Social + copyright */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <ul className="flex items-center justify-center gap-4">
            <li>
              <a
                href="#"
                title="Follow on Facebook"
                aria-label="Follow on Facebook"
                className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-sdgc-red text-white transition-opacity duration-300 hover:opacity-80"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px]">
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="#"
                title="Follow on X"
                aria-label="Follow on X"
                className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-sdgc-red text-white transition-opacity duration-300 hover:opacity-80"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[20px] w-[20px]">
                  <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.3 3h6.4l4.4 5.8L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z" />
                </svg>
              </a>
            </li>
          </ul>

          <p className="text-center font-sans text-[14px] text-white">
            Copyright &copy; {new Date().getFullYear()} | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
