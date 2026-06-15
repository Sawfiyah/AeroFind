import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import styles from "./HelpPage.module.css";

const FAQS = [
  {
    category: "Booking",
    items: [
      {
        q: "How do I book a flight?",
        a: "Search for your route on the homepage by selecting your origin, destination, date and number of passengers. Choose a flight from the results, pick your seat, fill in passenger details and confirm your booking.",
      },
      {
        q: "Can I book for multiple passengers?",
        a: "Yes. On the homepage, use the passengers selector to add adults, children (2-11 years) and infants (under 2). Each passenger will need their own seat except infants who sit on a lap.",
      },
      {
        q: "What is the difference between Economy and Business class?",
        a: "Business class offers seats in rows 1-4 with more legroom and a premium experience. Economy covers rows 8-30. Extra legroom seats in rows 5-7 are available to economy passengers for an additional fee.",
      },
      {
        q: "Can I skip seat selection?",
        a: 'Yes. On the seat selection page, tap "Skip seat selection" to proceed to booking without choosing a seat. A seat will be assigned at check-in.',
      },
    ],
  },
  {
    category: "Passengers & Fares",
    items: [
      {
        q: "How are child and infant fares calculated?",
        a: "Children (2-11 years) are charged 75% of the adult base fare. Infants (under 2 years) are charged 10% of the adult base fare as they travel on a lap without an assigned seat.",
      },
      {
        q: "What documents do children and infants need?",
        a: "Children and infants must travel with a valid birth certificate or passport. Infants must be accompanied by an adult at all times.",
      },
      {
        q: "Is there a maximum number of passengers per booking?",
        a: "Yes. A single booking can include a maximum of 9 passengers in total across adults, children and infants. Infants cannot exceed the number of adults as each infant requires a lap.",
      },
    ],
  },
  {
    category: "My Trips",
    items: [
      {
        q: "Where can I find my booking?",
        a: "All your bookings are saved under My Trips in the navigation bar. You will need to use the same device and browser as your booking reference is stored locally.",
      },
      {
        q: "Can I cancel or modify a booking?",
        a: "At the moment AeroFind does not support online cancellations or modifications. Please contact our support team with your booking reference for assistance.",
      },
    ],
  },
  {
    category: "Flights & Routes",
    items: [
      {
        q: "Which routes does AeroFind cover?",
        a: "AeroFind covers all major domestic Nigerian routes including Lagos (LOS), Abuja (ABV), Kano (KAN), Port Harcourt (PHC), Enugu (ENU), Calabar (CBQ), Ilorin (ILR), Sokoto (SKO) and Benin City (BNI).",
      },
      {
        q: "Which airlines operate on AeroFind?",
        a: "AeroFind aggregates flights from Air Peace, Ibom Air, Arik Air, Aero Contractors, Rano Air, United Nigeria and Dana Air — the seven major domestic carriers operating in Nigeria.",
      },
      {
        q: 'What does "Direct" and "1 Stop" mean?',
        a: "A direct flight goes straight from your origin to your destination with no intermediate stops. A 1-stop flight lands briefly at another airport before continuing to your destination.",
      },
    ],
  },
];

export default function HelpPage() {
  // const navigate = useNavigate();
  const [openItem, setOpenItem] = useState(null);

  function toggle(key) {
    setOpenItem((prev) => (prev === key ? null : key));
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Help Centre</h1>
          <p className={styles.pageSub}>
            Find answers to common questions about booking and flying with
            AeroFind.
          </p>
        </div>

        {/* FAQ sections */}
        {FAQS.map((section) => (
          <section key={section.category} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.category}</h2>

            <div className={styles.accordion}>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openItem === key;
                return (
                  <div
                    key={key}
                    className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}
                  >
                    <button
                      className={styles.accordionBtn}
                      onClick={() => toggle(key)}
                    >
                      <span>{item.q}</span>
                      <span
                        className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ""}`}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className={styles.accordionBody}>{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Contact strip */}
        <div className={styles.contactStrip}>
          <div>
            <p className={styles.contactTitle}>Still need help?</p>
            <p className={styles.contactSub}>
              Our support team is available 7 days a week, 7am - 10pm WAT.
            </p>
          </div>
          <div className={styles.contactBtns}>
            <a href="mailto:support@aerofind.com" className={styles.contactBtn}>
              ✉ Email us
            </a>
            <a href="tel:+2349000000000" className={styles.contactBtn}>
              📞 Call us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
