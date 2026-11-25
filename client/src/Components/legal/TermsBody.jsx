/**
 * presentational legal document
 * red “(Experimental)” markers for features not implemented yet.
 */
import { Link } from "react-router-dom";
import styles from "../../styles/termsBody.module.css";


function Exp() {
  return <span className={styles.experimental}> (Experimental)</span>;
}

/**
 * User Terms and Conditions — shared by the /eula page and register modal.
 */
function TermsBody() {
  return (
    <article className={styles.article}>
      <h2 className={styles.docTitle}>User Terms and Conditions for House For Paws</h2>
      <p className={styles.effective}>
        <strong>Effective date:</strong> May 9, 2026
      </p>
      <p className={styles.legend}>
        <span className={styles.experimental}>Red</span> marks wording that
        describes features or flows that are{" "}
        <strong>experimental</strong> or <strong>not in development yet</strong>.
      </p>

      <p>
        Welcome to House For Paws! These Terms and Conditions outline the rules
        and guidelines for the use of our platform, which is dedicated to
        promoting animal adoption and responsible pet care. By accessing or using
        our website, you agree to comply with these terms. If you do not agree,
        please refrain from using our platform.
      </p>

      <h2>1. Purpose of the Site</h2>
      <p>
        The primary objective of House For Paws is to connect individuals with
        adoptable animals from shelters and rescue organizations
        <Exp />. We aim to promote the responsible adoption, care, and
        well-being of pets. This platform does not facilitate the sale of animals
        in any form. All interactions facilitated by the website are aimed at
        animal adoption and care, not sales of any kind.
      </p>

      <h2>2. Use of the Website</h2>
      <p>By using this platform, you agree to:</p>
      <ul>
        <li>
          Engage only in activities related to animal adoption and care.
        </li>
        <li>
          Not engage in the sale, trade, or transfer of animals for monetary
          compensation or any other form of exchange and sales promotion.
        </li>
        <li>
          Provide accurate and truthful information during registration or
          adoption inquiries.
        </li>
        <li>
          Refrain from using the site for any illegal or unethical purposes.
        </li>
      </ul>

      <h2>3. Adoption Process</h2>
      <ul>
        <li>
          Our platform allows individuals to learn about available animals for
          adoption and connect with shelters and people who wish to help animals
          rescue organizations
          <Exp />.
        </li>
        <li>
          All adoption decisions are made solely by the respective shelters or
          adoption agencies
          <Exp />.
        </li>
        <li>
          House For Paws does not charge any fees for adopting animals, nor do we
          facilitate any monetary transactions related to animal adoption.
        </li>
      </ul>

      <h2>4. Advertising</h2>
      <p>
        Our platform is developing and unfunded; the site may include some ads.
      </p>

      <h2>5. Non-Commercial Cause</h2>
      <p>
        House For Paws is committed to the ethical adoption and care of animals.
        This platform does not permit the buying, selling, or trading of animals
        under any circumstances. Our purpose is to connect potential adopters
        with animals in need of homes through adoption agencies
        <Exp /> and shelters. Any attempt to buy or sell animals through our
        platform will result in immediate suspension or termination of access to
        the site.
      </p>

      <h2>6. Care and Responsibility</h2>
      <p>
        As a user, if you adopt an animal through our platform, you agree to:
      </p>
      <ul>
        <li>
          Provide the adopted animal with a safe, healthy, and loving
          environment.
        </li>
        <li>
          Adhere to all local laws and regulations regarding pet ownership.
        </li>
        <li>
          Understand that animal adoption is a long-term commitment and that care
          requirements may evolve over time.
        </li>
      </ul>

      <h2>7. User Content and Community Guidelines</h2>
      <p>
        Users are encouraged to contribute by sharing their experiences with
        animal adoption, pet care tips, or volunteer opportunities. However,
        please respect the following guidelines:
      </p>
      <ul>
        <li>Do not post offensive, harmful, or inappropriate content.</li>
        <li>
          Ensure that any content shared is relevant to animal adoption and care.
        </li>
        <li>
          Respect the privacy of others and refrain from sharing personal
          information without consent.
        </li>
      </ul>

      <h2>8. Third-Party Links and Resources</h2>
      <p>
        Our platform may contain links to third-party websites, shelters, or
        organizations. These links are provided for your convenience, but House
        For Paws does not endorse or take responsibility for the content or
        practices of these third-party sites.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        House For Paws is not liable for any damages or losses arising from the
        use of our platform or any interactions related to animal adoption. We
        do not guarantee the suitability of any animals for adoption or any
        outcomes from the adoption process.
      </p>

      <h2>10. Privacy and Data Protection</h2>
      <p>
        We value your privacy. Please refer to our Privacy Policy for detailed
        information on how we collect, use, and protect your personal data. You
        can also reach us via our{" "}
        <Link to="/contact">Contact</Link> page.
      </p>

      <h2>11. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the site if
        you violate these Terms and Conditions, engage in any activity related to
        animal sales, or violate any applicable laws.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        House For Paws reserves the right to modify or update these Terms and
        Conditions at any time. Any changes will be posted on this page with the
        updated date. Your continued use of the site constitutes your acceptance
        of any changes.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have any questions or concerns regarding these Terms and
        Conditions, please contact us at{" "}
        <a href="mailto:houseforpaws.info@gmail.com">houseforpaws.info@gmail.com</a>
        .
      </p>

      <p className={styles.summary}>
        This version reflects the nature of a non-profit platform for animal
        adoption and care, with clear terms about the prohibition of animal sales
        and ensuring responsible pet ownership.
      </p>

      <p className={styles.copyright}>
        © Copyright to Amit Nusuyav.
      </p>
    </article>
  );
}

export default TermsBody;
