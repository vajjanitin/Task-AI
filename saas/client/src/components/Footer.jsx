import { assets } from "../assets/assets";

export default function Footer() {
  return (
    <footer className="footer-home px-4 md:px-8 lg:px-16 xl:px-24 pt-6 w-full text-gray-600">
      <div className="footer-content flex flex-col md:flex-row justify-between w-full gap-6 border-b border-gray-400 pb-4">
        <div className="footer-brand md:max-w-lg">
          <img className="footer-logo h-8" src={assets.logo} alt="logo" />
          <p className="footer-description mt-4 text-sm leading-relaxed">
            Experience the power of AI with Promptify...
            <br />
            Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
          </p>
        </div>

        <div className="footer-links flex-1 flex flex-col md:flex-row gap-8 md:justify-end">
          <div className="footer-links-group">
            <h2 className="footer-links-title mb-3 text-gray-800">Company</h2>
            <ul className="text-sm space-y-1">
              <li className="footer-link-item"><a href="/">Home</a></li>
              <li className="footer-link-item"><a href="/about">About us</a></li>
              <li className="footer-link-item"><a href="/contact-us">Contact us</a></li>
              <li className="footer-link-item"><a href="/privacy-policy">Privacy policy</a></li>
            </ul>
          </div>

          
        </div>
      </div>

      <p className="footer-copyright pt-3 text-center text-xs md:text-sm pb-4">
        Copyright 2025 © <a href="/" className="footer-copyright-link">Quick.AI</a>. All Right Reserved.
      </p>
    </footer>
  );
}
