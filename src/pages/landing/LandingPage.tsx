import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { usePublicContent } from "@/hooks/usePublicContent";
import { useContent } from "@/hooks/useContent";
import { useAuthStatus } from "@/context/AuthStatusContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { livestreamService } from "@/services/livestream.service";
import type { ServiceTime } from "@/types";

const PublicLivestreamPlayer = lazy(
  () => import("@/components/livestream/PublicLivestreamPlayer"),
);

export default function LandingPage() {
  const { content, loading } = usePublicContent();
  const { serviceTimes: services } = useContent();
  const { authStatus, loading: authLoading } = useAuthStatus();
  const { user } = useAuth();
  const { data: streamStatus } = useQuery({
    queryKey: ['public-stream-status'],
    queryFn: livestreamService.getPublicStatus,
    enabled: !!user,
  });
  const isLive = (streamStatus as any)?.is_live ?? false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <picture className="absolute inset-0 w-full h-full">
          <source srcSet="/bibleway.jpg" type="image/jpeg" />
          <img
            src="/bibleway.jpeg"
            alt="Bibleway Fellowship"
            className="w-full h-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.hero_title}
            </h1>
            <div
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 prose prose-xl max-w-none [&>p]:text-white [&>p]:opacity-90"
              dangerouslySetInnerHTML={{ __html: content.hero_subtitle }}
            ></div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!authLoading && (
                user ? (
                  <Link
                    to={isLive ? "/member-dashboard?tab=livestream" : "/member-dashboard"}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap"
                  >
                    {isLive ? "Join Service" : "Visit Dashboard"}
                  </Link>
                ) : authStatus?.signup_enabled && (
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Join Us
                  </Link>
                )
              )}
              <a
                href="#services"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                Learn More
              </a>
            </div>
            <div className="mt-8 max-w-2xl mx-auto w-full">
              <Suspense fallback={null}>
                <PublicLivestreamPlayer />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                ABOUT
              </h2>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div
              className="prose prose-lg max-w-none text-gray-700 [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:font-bold [&>p:first-child]:first-letter:text-blue-600 [&>p:first-child]:first-letter:mr-2 [&>p:first-child]:first-letter:float-left"
              dangerouslySetInnerHTML={{ __html: content.about_text }}
            ></div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/about"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join us in worship and fellowship
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
              <i className="ri-calendar-line text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600 font-medium">
                No service times available
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Please check back later for updated service schedules
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${services.length === 1 ? "grid-cols-1 max-w-md mx-auto" : services.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {services.map((service: ServiceTime, index: number) => {
                const colors = [
                  {
                    bg: "bg-blue-100",
                    text: "text-blue-600",
                    icon: "ri-sun-line",
                  },
                  {
                    bg: "bg-green-100",
                    text: "text-green-600",
                    icon: "ri-moon-line",
                  },
                  {
                    bg: "bg-purple-100",
                    text: "text-purple-600",
                    icon: "ri-book-open-line",
                  },
                  {
                    bg: "bg-orange-100",
                    text: "text-orange-600",
                    icon: "ri-time-line",
                  },
                ];
                const color = colors[index % colors.length];
                const formatTime = (time: string) => {
                  if (!time) return "";
                  const [hours, minutes] = time.split(":");
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                };
                return (
                  <div
                    key={service.id ?? index}
                    className="flex items-start space-x-4 p-8 bg-white rounded-lg shadow-md border border-gray-200 min-h-[200px] transition-all duration-500 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <i className={`${color.icon} ${color.text} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.service}
                      </h3>
                      {service.description && (
                        <p className="text-gray-600 mb-2 text-sm">
                          {service.description}
                        </p>
                      )}
                      <p className={`text-sm ${color.text} font-medium`}>
                        {service.day} •{" "}
                        {service.time ? formatTime(service.time) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Visit Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We'd love to meet you! Come as you are and experience the warmth
              of our church family.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Location
                    </h3>
                    <p className="text-gray-600">
                      {content.address_line1}
                      <br />
                      {content.address_line2}
                      <br />
                      {content.address_line3}
                      <br />
                      {content.address_line4}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-mail-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Email
                    </h3>
                    <p className="text-gray-600">{content.contact_email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Service Times
                    </h3>
                    <p className="text-gray-600">
                      {content.service_time1}
                      <br />
                      {content.service_time2}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${content.address_line1}, ${content.address_line2}, ${content.address_line3}, ${content.address_line4}`)}`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Church Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Take the next step in your faith journey. Connect with us today and
            become part of our church family.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!authLoading && authStatus?.login_enabled && (
              <Link
                to="/login"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer whitespace-nowrap"
              >
                Member Login
              </Link>
            )}
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
