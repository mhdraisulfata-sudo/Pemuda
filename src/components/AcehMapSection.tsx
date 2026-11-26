import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface AcehMapSectionProps {
  regions: string[];
}

export function AcehMapSection({ regions }: AcehMapSectionProps) {
  return (
    <section className="py-16 border-t border-[#152822]">
      <div className="w-[min(1200px,92%)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="text-[#3ad19e] font-semibold text-xs tracking-wide">
            Orientasi Wilayah
          </div>
          <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] mt-1.5 mb-2 text-[#ecf5f1] tracking-[-0.015em] font-semibold">
            Peta ilustratif Aceh
          </h2>
          <p className="text-[#97b0a5] m-0 max-w-[540px] text-[15px]">
            Skema lokasi untuk orientasi awal, bukan peta navigasi atau penentu
            jarak resmi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl bg-[#0f1f1a] border border-[#1d352d] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center card-shadow"
        >
          <svg
            viewBox="0 0 440 300"
            role="img"
            aria-label="Peta ilustratif wilayah Aceh"
            className="w-full max-h-[280px]"
          >
            <path
              d="M95 20 L160 35 188 70 238 82 260 115 315 125 335 170 310 210 270 220 246 270 205 250 176 225 140 220 115 180 80 160 70 110 45 75Z"
              fill="#143329"
              stroke="#24b486"
              strokeWidth="2.5"
            />
            <motion.path
              d="M70 110 Q140 125 180 110 T310 155"
              fill="none"
              stroke="#4ae3b1"
              strokeOpacity="0.65"
              strokeWidth="3.5"
              strokeDasharray="7 7"
              initial={{ pathLength: 0, opacity: 0.3 }}
              whileInView={{ pathLength: 1, opacity: 0.65 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
            <g fill="#24b486" stroke="#07110e" strokeWidth="2.5">
              <circle cx="120" cy="180" r="7.5" />
              <circle cx="82" cy="150" r="7.5" />
              <circle cx="170" cy="90" r="7.5" />
              <circle cx="255" cy="135" r="7.5" />
              <circle cx="275" cy="205" r="7.5" />
            </g>
            <g fill="#dceee6" fontSize="12" fontWeight="600">
              <text x="20" y="205">
                Banda Aceh
              </text>
              <text x="5" y="138">
                Sabang
              </text>
              <text x="150" y="72">
                Aceh Besar
              </text>
              <text x="265" y="125">
                Aceh Tengah
              </text>
              <text x="285" y="225">
                Bener Meriah
              </text>
            </g>
            <text x="20" y="285" fill="#849f93" fontSize="10">
              Skema ilustratif · tidak berskala
            </text>
          </svg>

          <div>
            <div className="grid gap-2.5">
              {regions.map((region) => (
                <motion.a
                  key={region}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(region + ', Aceh')}`}
                  className="bg-[#091411] border border-[#1d352d] px-4 py-3 rounded-lg no-underline text-[13.5px] font-semibold text-[#ecf5f1] hover:border-[#24b486] transition-colors flex items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#3ad19e]" strokeWidth={1.8} />
                    <span>{region}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#97b0a5]" strokeWidth={1.8} />
                </motion.a>
              ))}
            </div>
            <p className="text-xs text-[#97b0a5] mt-3.5 mb-0 leading-relaxed">
              Lokasi dan deskripsi destinasi merupakan data contoh untuk
              prototipe. Periksa informasi resmi dan kondisi terbaru sebelum
              bepergian.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
