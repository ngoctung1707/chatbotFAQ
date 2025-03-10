"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const homeLinks = [
  { id: 1, name: "01. Business", path: "/" },
  { id: 2, name: "02. Finance", path: "/index-2" },
  { id: 3, name: "03. Consulting", path: "/index-3" },
  { id: 4, name: "04. Insurance", path: "/index-4" },
  { id: 5, name: "05. Digital agency", path: "/index-5" },
  { id: 6, name: "06. Finance Solutions", path: "/index-6" },
  { id: 7, name: "07. Accounting Services", path: "/index-7" },
  { id: 8, name: "08. IT Solutions", path: "/index-8" },
];
const aboutLinks = [
  { id: 1, name: "Business About", path: "/about" },
  { id: 2, name: "Finance About", path: "/about-2" },
  { id: 3, name: "Consulting About", path: "/about-5" },
  { id: 4, name: "Insurance About", path: "/about-4" },
  { id: 5, name: "Digital agency About", path: "/about-3" },
];
const servicesLinks = [
  { id: 1, name: "Business Service", path: "/services" },
  { id: 2, name: "Finance Service", path: "/services-2" },
  { id: 3, name: "Consulting Service", path: "/services-3" },
  { id: 4, name: "Insurance Service", path: "/services-4" },
  { id: 5, name: "Digital agency Service", path: "/services-5" },
  { id: 6, name: "Service Details One", path: "/services-details" },
  { id: 7, name: "Service Details Two", path: "/services-details-2" },
  { id: 8, name: "Service Details Three", path: "/services-details-3" },
  { id: 9, name: "Service Details Four", path: "/services-details-4" },
  { id: 10, name: "Service Details Five", path: "/services-details-5" },
];
const pagesLinks = [
  { id: 1, name: "Contact", path: "/contact" },
  { id: 1, name: "Team One", path: "/team" },
  { id: 2, name: "Team Two", path: "/team-2" },
  { id: 3, name: "Team Three", path: "/team-3" },
  { id: 4, name: "Team Four", path: "/team-4" },
  { id: 5, name: "Team Details", path: "/team-details" },
  { id: 6, name: "Project Details", path: "/project-details" },
  { id: 7, name: "404 Error Page", path: "/error" },
  { id: 8, name: "Login Page", path: "/login" },
  { id: 9, name: "Register Page", path: "/register" },
  { id: 10, name: "Forgot password Page", path: "/forgot-password" },
];
const blogLinks = [
  { id: 1, name: "Our Blog", path: "/blog" },
  { id: 2, name: "Blog Details", path: "/blog-details" },
];
export default function Menu() {
  const pathname = usePathname();
  const isActive = (path) => path === pathname;
  const isHomeLinkActive = () => {
    return homeLinks.some((link) => link.path === pathname) ? 1 : 0;
  };
  const isAboutLinkActive = () => {
    return aboutLinks.some((link) => link.path === pathname) ? 1 : 0;
  };
  const isServicesLinkActive = () => {
    return servicesLinks.some((link) => link.path === pathname) ? 1 : 0;
  };
  const isPagesLinkActive = () => {
    return pagesLinks.some((link) => link.path === pathname) ? 1 : 0;
  };
  const isBlogLinkActive = () => {
    return blogLinks.some((link) => link.path === pathname) ? 1 : 0;
  };
  return (
    <>
      <ul className="navigation">
        <li className="menu-item-has-children">
          <Link href="#" className={isHomeLinkActive() ? "active" : ""}>
            Home
          </Link>
          <ul className="sub-menu">
            {homeLinks.map((link) => {
              return (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    className={isActive(link.path) ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isAboutLinkActive() ? "active" : ""}>
            About Us
          </Link>
          <ul className="sub-menu">
            {aboutLinks.map((link) => {
              return (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    className={isActive(link.path) ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isServicesLinkActive() ? "active" : ""}>
            Services
          </Link>
          <ul className="sub-menu">
            {servicesLinks.map((link) => {
              return (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    className={isActive(link.path) ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isPagesLinkActive() ? "active" : ""}>
            Pages
          </Link>
          <ul className="sub-menu">
            {pagesLinks.map((link) => {
              return (
                <li key={`${link.id}-${link.name}`}>
                  <Link
                    href={link.path}
                    className={isActive(link.path) ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isBlogLinkActive() ? "active" : ""}>
            Blog
          </Link>
          <ul className="sub-menu">
            {blogLinks.map((link) => {
              return (
                <li key={link.id}>
                  <Link
                    href={link.path}
                    className={isActive(link.path) ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li>
          <Link
            href="/contact"
            className={isActive("/contact") ? "active" : ""}
          >
            contacts
          </Link>
        </li>
      </ul>
    </>
  );
}
