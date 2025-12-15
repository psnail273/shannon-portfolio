import Image from 'next/image';

export default function About() {
  return (
    <div className="flex flex-col gap-8 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
      <div className="text-5xl  font-playfair">About</div>
      <Image src="/shannon_about.jpg" alt="Shannon" width={ 500 } height={ 500 } />
      <div className="flex flex-col gap-4">
        <div>
          I received my Bachelor&apos;s degree from Indiana State University with an emphasis in Graphic Design and Art History in 2011. After working for our student newspaper and excelling in both design and sales roles, I went on to work for Schurz Communications, a multimedia design agency, for 3 years post graduation. From there I was a Marketing Assistant for Simon Property Group, helming our social media accounts and organizing special events. In recent years, I&apos;ve worked with Eli Lilly and Bayer Crop Science as a Product Designer on internal applications to help employees more easily complete their work. 
        </div>
        <div>
          My passion for User Experience design stems from the part of my brain that won&apos;t shut off when things don&apos;t work with ease. I am contentiously evaluating what tweaks could make a product more functional and engaging to use. I began teaching myself in 2015 through books, taking online courses via Interaction Design Foundation, listening to podcasts, and attending UX meetups and conferences in Indianapolis, Champaign, Louisville, and Chicago. I am continuously inspired by the amazing work this community is doing.
        </div>
        <div>
          My creative approach—no matter the medium—is to create a usable design and be an advocate for the user. An app can be visually compelling and beautiful to look at, but if it&apos;s not functional, the app is ultimately ineffective. To combat this, my process comes together through A/B testing, communicating with stakeholders to find weak points, and collecting data to defend or oppose my research. These methods result in functional products that are a pleasure for the user to engage with, which is my ultimate goal for any design.
        </div>
        <div>
          In my spare time, I can be found petting all the animals, seeking out new subscription boxes, and dreaming of my next trip to Disney World.
        </div>
        <div>
          Want to work together? I&apos;d love to chat! E-mail me any time at shannon@shannoncall.com.
        </div>
      </div>
      
    </div>
  );
}