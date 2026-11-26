import { ArrowUpRight, MapPin } from 'lucide-react';

interface AcehMapSectionProps {
  regions: string[];
}

export function AcehMapSection({ regions }: AcehMapSectionProps) {
  return (
    <section className="py-16 border-t border-[#e5ede8]">
      <div className="w-[min(1200px,92%)] mx-auto">
        <div className="mb-8">
          <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
            Orientasi Wilayah
          </div>
          <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] mt-1.5 mb-2 text-[#064e3b] tracking-[-0.02em] font-semibold">
            Peta ilustratif Aceh
          </h2>
          <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
            Skema lokasi untuk orientasi awal, bukan peta navigasi atau penentu
            jarak resmi.
          </p>
        </div>

        <div className="rounded-xl bg-[#eef5f0] border border-[#dce6df] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <svg
            viewBox="0 0 440 300"
            role="img"
            aria-label="Peta ilustratif wilayah Aceh"
            className="w-full max-h-[280px]"
          >
            <path
              d="M95 20 L160 35 188 70 238 82 260 115 315 125 335 170 310 210 270 220 246 270 205 250 176 225 140 220 115 180 80 160 70 110 45 75Z"
              fill="#c5e2d2"
              stroke="#3b8768"
              strokeWidth="2.5"
            />
            <path
              d="M70 110 Q140 125 180 110 T310 155"
              fill="none"
              stroke="#fff"
              strokeWidth="4.5"
              strokeDasharray="7 7"
            />
            <g fill="#064e3b" stroke="#fff" strokeWidth="2.5">
              <circle cx="120" cy="180" r="7.5" />
              <circle cx="82" cy="150" r="7.5" />
              <circle cx="170" cy="90" r="7.5" />
              <circle cx="255" cy="135" r="7.5" />
              <circle cx="275" cy="205" r="7.5" />
            </g>
            <g fill="#133d2f" fontSize="12" fontWeight="600">
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
            <text x="20" y="285" fill="#5a6f67" fontSize="10">
              Skema ilustratif · tidak berskala
            </text>
          </svg>

          <div>
            <div className="grid gap-2.5">
              {regions.map((region) => (
                <a
                  key={region}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(region + ', Aceh')}`}
                  className="bg-white border border-[#dce6df] px-4 py-3 rounded-lg no-underline text-[13.5px] font-semibold text-[#064e3b] hover:border-[#0d8a68] transition-colors flex items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0d8a68]" strokeWidth={1.8} />
                    <span>{region}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#5a6f67]" strokeWidth={1.8} />
                </a>
              ))}
            </div>
            <p className="text-xs text-[#5a6f67] mt-3.5 mb-0 leading-relaxed">
              Lokasi dan deskripsi destinasi merupakan data contoh untuk
              prototipe. Periksa informasi resmi dan kondisi terbaru sebelum
              bepergian.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
