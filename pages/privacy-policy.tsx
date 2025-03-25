// pages/privacy-policy.tsx
import Head from "next/head";
import Script from "next/script";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white dark:bg-gradient-to-b from-premium-light to-white transition-colors duration-300">
      <div className="container mx-auto p-6 max-w-4xl ">
        <Head>
          <title>Privacy Policy - Troysarl</title>
        </Head>

        {/* Google Analytics Scriptleri */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
        </Script>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            PRIVACY POLICY AND COOKIE POLICY Troy Cars Lux Sarl This Privacy
            Policy explains how Troy Cars Lux Sarl (https://www.troysarl.com )
            collects, uses, and shares your personal information. This document
            also outlines your privacy rights and how your data is protected
            under applicable laws. Terms of Use By using our Service
            (https://www.troysarl.com ), you agree to the collection, use, and
            sharing of your information as described in this Privacy Policy. If
            you do not agree to these terms, please refrain from accessing or
            using our Service. Troy Cars Lux Sarl reserves the right to modify
            this Privacy Policy at any time without prior notice. The updated
            version will be posted on https://www.troysarl.com . 1. DATA
            COLLECTION AND SHARING 1.1 Data Collection We may collect the
            following types of information: Personal details: Your name, email
            address, phone number. Financial details: Bank account information,
            credit card details. Vehicle-related details: License plate number,
            transmission type, engine power, vehicle images, etc. Test drive
            details: A copy of your driver&apos;s license (for test drive
            requests). Information provided through contact forms. 1.2 Data
            Sharing We may share your personal information in the following
            cases: Legal obligations: To comply with legal requirements or
            respond to lawful requests from authorities. Financial services: For
            financing or leasing arrangements with financial providers.
            Third-party service providers: To support operational processes,
            such as payment processing platforms or CRM systems. Security
            purposes: Video surveillance footage is used solely for security
            purposes. 2. THIRD-PARTY DATA SHARING 2.1 Security Standards All
            third parties we work with are required to implement appropriate
            security measures to protect your data. They are only permitted to
            process your data for specified purposes and in accordance with our
            instructions. 2.2 Data Transfers Outside the EU If we transfer your
            personal data outside the European Union, we ensure that a similar
            level of data protection is maintained. This may include using
            mechanisms like Standard Contractual Clauses (SCCs). 3. COOKIES 3.1
            What Are Cookies? Cookies are small text files placed on your device
            by websites you visit. They help improve website functionality and
            track user preferences. 3.2 Types of Cookies We Use Strictly
            Necessary Cookies: Essential for the basic functions of our website.
            Statistical Cookies: Used to analyze how visitors interact with our
            site anonymously. Marketing/Tracking Cookies: Used to display
            personalized advertisements based on user behavior. 3.3 Cookie
            Consent You must provide explicit consent for non-essential cookies.
            You can manage your cookie preferences via your browser settings. 4.
            DATA SECURITY We implement technical and organizational security
            measures to protect your personal data. However, no online data
            transmission can be guaranteed 100% secure. By using our Service,
            you acknowledge and accept any risks involved. 5. DATA RETENTION We
            retain your personal data only for as long as necessary to fulfill
            the purposes outlined in this policy. 6. YOUR DATA RIGHTS You have
            the following rights regarding your personal data: Right to
            Information: Know why your data is collected, how it will be used,
            and how long it will be retained. Right of Access: Request access to
            the personal data we process about you. Right to Rectification:
            Update, correct, or delete inaccurate personal data. Right to
            Erasure: Request deletion of your personal data. Right to Data
            Portability: Obtain a copy of your personal data to transfer it to
            another service provider. Right to Object: Object to the processing
            of your data unless there are legitimate grounds for processing. To
            exercise these rights, please contact us using the details below. 7.
            CHILDREN&apos;S DATA Our website primarily interacts with adult
            customers. We do not intentionally collect personal data from
            individuals under the age of 16 unless parental consent is provided.
            8. LEGAL COMPLIANCE This Privacy Policy complies with Luxembourg
            data protection laws and the European Union General Data Protection
            Regulation (GDPR). 9. CONTACT INFORMATION For any questions or
            concerns regarding this Privacy Policy, please contact us at:
            Address: Troy Cars Lux Sarl, 9 rue Geespelt, L-3378 Livange,
            Luxembourg Website: https://www.troysarl.com Email:
            info@troysarl.com VAT Number: LU35903812 Company Registration
            Number: B288193 10. LAST UPDATED This Privacy Policy was last
            updated on: 25.3.2025
          </p>
        </div>
      </div>
    </div>
  );
}
