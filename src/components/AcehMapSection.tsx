interface AcehMapSectionProps {
  regions: string[];
}

export function AcehMapSection({ regions }: AcehMapSectionProps) {
  return (
    <section className="pt-[5px] pb-[58px]">
      <div className="w-[min(1160px,92%)] mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
          <div>
            <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
              Explore by location
            </div>
            <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
              Peta ilustratif Aceh
            </h2>
            <p className="text-[#687b75] m-0 max-w-[530px]">
              Skema lokasi untuk orientasi awal, bukan peta navigasi atau penentu
              jarak.
            </p>
          </div>
        </div>

        <div className="rounded-[22px] bg-[#e9f5ef] border border-[#d5e9dd] p-5 grid grid-cols-1 md:grid-cols-2 gap-[18px] items-center">
          <svg
            viewBox="0 0 440 300"
            role="img"
            aria-label="Peta ilustratif wilayah Aceh"
            className="w-full max-h-[280px]"
          >
            <path
              d="M95 20 L160 35 188 70 238 82 260 115 315 125 335 170 310 210 270 220 246 270 205 250 176 225 140 220 115 180 80 160 70 110 45 75Z"
              fill="#b7ddc9"
              stroke="#4d9c7a"
              strokeWidth="3"
            />
            <path
              d="M70 110 Q140 125 180 110 T310 155"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeDasharray="7 7"
            />
            <g fill="#087f5b" stroke="#fff" strokeWidth="3">
              <circle cx="120" cy="180" r="8" />
              <circle cx="82" cy="150" r="8" />
              <circle cx="170" cy="90" r="8" />
              <circle cx="255" cy="135" r="8" />
              <circle cx="275" cy="205" r="8" />
            </g>
            <g fill="#174d3b" fontSize="12" fontWeight="700">
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
            <text x="20" y="285" fill="#658578" fontSize="10">
              Skema ilustratif · tidak berskala
            </text>
          </svg>

          <div>
            <div className="grid gap-[9px]">
              {regions.map((region) => (
                <a
                  key={region}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(region + ', Aceh')}`}
                  className="bg-white px-3 py-[10px] rounded-[11px] no-underline text-[13px] font-bold text-[#064e3b] hover:outline hover:outline-1 hover:outline-[#19a7a0] flex items-center justify-between"
                >
                  <span>📍 {region}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
            <div className="text-[11px] text-[#687b75] bg-[#f2f7f3] px-3 py-[10px] rounded-[10px] mt-3">
              Lokasi dan deskripsi destinasi merupakan data contoh untuk
              prototipe. Periksa informasi resmi dan kondisi terbaru sebelum
              bepergian.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
