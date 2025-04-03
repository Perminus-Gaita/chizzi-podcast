import { cx } from "../../utils/styling";

export const ChevronDown = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // fill="none"
    viewBox="0 0 20 20"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path
      //   fill="#000"
      d="m8.728 15.795-5-8A1.5 1.5 0 0 1 5 5.5h10a1.5 1.5 0 0 1 1.272 2.295l-5 8a1.5 1.5 0 0 1-2.544 0Z"
    />
  </svg>
);

export const ChevronUp = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // fill="none"
    viewBox="0 0 20 20"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path
      //   fill="#000"
      d="m11.272 5.205 5 8A1.5 1.5 0 0 1 15 15.5H5a1.5 1.5 0 0 1-1.272-2.295l5-8a1.5 1.5 0 0 1 2.544 0Z"
    />
  </svg>
);

export const ArrowRight = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // fill="none"
    viewBox="0 0 24 24"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <g>
      <path
        fillRule="evenodd"
        d="M3.25 12a.75.75 0 0 1 .75-.75h9.25v1.5H4a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
        opacity={0.5}
      />
      <path d="M13.25 12.75V18a.75.75 0 0 0 1.28.53l6-6a.75.75 0 0 0 0-1.06l-6-6a.75.75 0 0 0-1.28.53v6.75Z" />
    </g>
  </svg>
);

export const ArrowLeft = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // fill="none"
    viewBox="0 0 24 24"
    {...rest}
    className={cx(/**"w-full h-auto",*/ className)}
  >
    <g>
      <path
        fillRule="evenodd"
        d="M20.75 12a.75.75 0 0 0-.75-.75h-9.25v1.5H20a.75.75 0 0 0 .75-.75Z"
        clipRule="evenodd"
        opacity={0.5}
      />
      <path d="M10.75 18a.75.75 0 0 1-1.28.53l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.28.53v12Z" />
    </g>
  </svg>
);

export const FacebookIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path
      fill="#4460A0"
      fillRule="evenodd"
      d="M25.638 48H2.65A2.65 2.65 0 0 1 0 45.35V2.65A2.649 2.649 0 0 1 2.65 0H45.35A2.649 2.649 0 0 1 48 2.65v42.7A2.65 2.65 0 0 1 45.351 48H33.119V29.412h6.24l.934-7.244h-7.174v-4.625c0-2.098.583-3.527 3.59-3.527l3.836-.002V7.535c-.663-.088-2.94-.285-5.59-.285-5.53 0-9.317 3.376-9.317 9.575v5.343h-6.255v7.244h6.255V48Z"
    />
  </svg>
);

export const InstagramIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <rect width={28} height={28} x={2} y={2} fill="url(#a)" rx={6} />
    <rect width={28} height={28} x={2} y={2} fill="url(#b)" rx={6} />
    <rect width={28} height={28} x={2} y={2} fill="url(#c)" rx={6} />
    <path fill="#fff" d="M23 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M16 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      clipRule="evenodd"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M6 15.6c0-3.36 0-5.04.654-6.324a6 6 0 0 1 2.622-2.622C10.56 6 12.24 6 15.6 6h.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C26 10.56 26 12.24 26 15.6v.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C21.44 26 19.76 26 16.4 26h-.8c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C6 21.44 6 19.76 6 16.4v-.8ZM15.6 8h.8c1.713 0 2.878.002 3.778.075.877.072 1.325.202 1.638.361a4 4 0 0 1 1.748 1.748c.16.313.29.761.36 1.638.074.9.076 2.065.076 3.778v.8c0 1.713-.002 2.878-.075 3.778-.072.877-.202 1.325-.361 1.638a4 4 0 0 1-1.748 1.748c-.313.16-.761.29-1.638.36-.9.074-2.065.076-3.778.076h-.8c-1.713 0-2.878-.002-3.778-.075-.877-.072-1.325-.202-1.638-.361a4 4 0 0 1-1.748-1.748c-.16-.313-.29-.761-.36-1.638C8.001 19.278 8 18.113 8 16.4v-.8c0-1.713.002-2.878.075-3.778.072-.877.202-1.325.361-1.638a4 4 0 0 1 1.748-1.748c.313-.16.761-.29 1.638-.36.9-.074 2.065-.076 3.778-.076Z"
      clipRule="evenodd"
    />
    <defs>
      <radialGradient
        id="a"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="rotate(-55.376 27.916 .066) scale(25.5196)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B13589" />
        <stop offset={0.793} stopColor="#C62F94" />
        <stop offset={1} stopColor="#8A3AC8" />
      </radialGradient>
      <radialGradient
        id="b"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="rotate(-65.136 29.766 6.89) scale(22.5942)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E0E8B7" />
        <stop offset={0.445} stopColor="#FB8A2E" />
        <stop offset={0.715} stopColor="#E2425C" />
        <stop offset={1} stopColor="#E2425C" stopOpacity={0} />
      </radialGradient>
      <radialGradient
        id="c"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(38.50003 -5.5 1.1764 8.23476 .5 3)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.157} stopColor="#406ADC" />
        <stop offset={0.468} stopColor="#6A45BE" />
        <stop offset={1} stopColor="#6A45BE" stopOpacity={0} />
      </radialGradient>
    </defs>
  </svg>
);

export const YoutubeIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -7 48 48"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <title>{"Youtube-color"}</title>
    <path
      fill="#CE1312"
      fillRule="evenodd"
      d="m19.044 23.27-.002-13.582 12.97 6.814-12.968 6.768ZM47.52 7.334s-.47-3.33-1.908-4.798C43.786.61 41.74.601 40.803.49 34.086 0 24.011 0 24.011 0h-.022S13.914 0 7.197.49C6.258.6 4.214.61 2.387 2.535.948 4.003.48 7.334.48 7.334S0 11.247 0 15.158v3.668c0 3.912.48 7.823.48 7.823s.468 3.331 1.907 4.798c1.827 1.926 4.225 1.866 5.293 2.067C11.52 33.885 24 34 24 34s10.086-.015 16.803-.505c.938-.113 2.983-.122 4.809-2.048 1.438-1.467 1.908-4.798 1.908-4.798s.48-3.91.48-7.823v-3.668c0-3.911-.48-7.824-.48-7.824Z"
    />
  </svg>
);

export const TiktokIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path
      fill="#EE1D52"
      d="M8.451 19.793c.156-1.294.687-2.019 1.687-2.761 1.43-1.006 3.218-.437 3.218-.437V13.22c.435-.011.87.014 1.3.077v4.343s-1.788-.569-3.219.438c-.999.742-1.53 1.467-1.686 2.76-.005.703.126 1.621.734 2.416a5.932 5.932 0 0 1-.46-.264c-1.337-.898-1.58-2.245-1.574-3.197ZM22.035 6.979c-.984-1.079-1.356-2.168-1.49-2.933h1.237s-.247 2.006 1.553 3.979l.025.026a7.133 7.133 0 0 1-1.325-1.072ZM28 10.037v4.256s-1.58-.062-2.75-.36c-1.632-.415-2.681-1.053-2.681-1.053s-.725-.456-.784-.487v8.789c0 .49-.134 1.711-.543 2.73-.533 1.334-1.356 2.21-1.508 2.388 0 0-1 1.183-2.767 1.98-1.592.719-2.99.7-3.407.719 0 0-2.417.095-4.59-1.318a9.125 9.125 0 0 1-1.312-1.053l.011.008c2.175 1.413 4.59 1.317 4.59 1.317.419-.018 1.817 0 3.408-.719 1.765-.797 2.767-1.98 2.767-1.98.15-.179.977-1.054 1.508-2.388.408-1.019.543-2.241.543-2.73v-8.788c.059.032.783.487.783.487s1.05.638 2.683 1.054c1.17.297 2.749.36 2.749.36V9.912c.54.121 1.001.154 1.3.124Z"
    />
    <path
      fill="#000"
      d="M26.7 9.913v3.334s-1.579-.062-2.748-.36c-1.633-.415-2.683-1.053-2.683-1.053s-.725-.455-.783-.488v8.79c0 .49-.134 1.712-.543 2.731-.533 1.334-1.356 2.21-1.508 2.388 0 0-1.001 1.183-2.767 1.98-1.591.719-2.99.7-3.408.719 0 0-2.415.096-4.59-1.317l-.01-.008a8.326 8.326 0 0 1-.648-.703c-.694-.846-1.12-1.847-1.227-2.133v-.003c-.172-.496-.533-1.688-.484-2.842.088-2.036.804-3.285.993-3.599a8.553 8.553 0 0 1 1.928-2.257 8.13 8.13 0 0 1 2.291-1.3 7.97 7.97 0 0 1 2.844-.572v3.375s-1.788-.567-3.218.437c-1 .742-1.53 1.467-1.687 2.76-.007.953.237 2.3 1.573 3.199.156.099.31.186.46.263.233.304.517.568.84.783 1.306.826 2.4.884 3.799.347.932-.359 1.635-1.167 1.96-2.063.205-.56.202-1.123.202-1.706V4.046h3.256c.134.765.506 1.854 1.49 2.933.396.407.84.767 1.325 1.072.144.149.876.881 1.816 1.331.487.233 1 .41 1.528.531Z"
    />
    <path
      fill="#69C9D0"
      d="M4.49 22.757v.002l.08.22c-.01-.026-.04-.104-.08-.222Z"
    />
    <path
      fill="#69C9D0"
      d="M10.513 13.792a8.136 8.136 0 0 0-2.291 1.3 8.554 8.554 0 0 0-1.927 2.262c-.19.312-.906 1.563-.993 3.599-.05 1.154.312 2.345.484 2.841v.004c.108.283.532 1.284 1.226 2.132.202.246.418.481.647.703a8.9 8.9 0 0 1-1.947-1.75c-.688-.838-1.112-1.828-1.223-2.12a.05.05 0 0 1 0-.007v-.003c-.172-.496-.535-1.688-.484-2.843.087-2.036.803-3.286.993-3.6a8.542 8.542 0 0 1 1.927-2.261 8.118 8.118 0 0 1 2.291-1.3 8.108 8.108 0 0 1 1.616-.456 8.372 8.372 0 0 1 2.527-.035v.962a7.971 7.971 0 0 0-2.846.572Z"
    />
    <path
      fill="#69C9D0"
      d="M20.544 4.046h-3.256v16.57c0 .582 0 1.144-.202 1.705-.328.896-1.028 1.704-1.96 2.063-1.4.539-2.493.48-3.798-.347a3.51 3.51 0 0 1-.844-.78c1.112.568 2.107.558 3.34.084.932-.359 1.632-1.168 1.96-2.064.205-.56.202-1.122.202-1.704V3h4.496s-.05.412.062 1.046ZM26.7 8.991v.922a7.29 7.29 0 0 1-1.524-.53c-.94-.45-1.673-1.183-1.817-1.332.167.105.34.2.517.285 1.143.547 2.27.71 2.824.655Z"
    />
  </svg>
);

export const MenuOpenIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 48 48"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path fill="#fff" fillOpacity={0.01} d="M0 0h48v48H0z" />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M8 11h32M8 24h34M8 37h32M36.343 29.657 42 24l-5.657-5.657"
    />
  </svg>
);

export const MenuCloseIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 17h8m-8-5h14m-8-5h8"
    />
  </svg>
);

export const NotificationIcon = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...rest}
    className={cx("w-full h-auto", className)}
  >
    <g stroke="#00b8ff" strokeWidth={1.5}>
      <path d="M18.75 9.71v-.705C18.75 5.136 15.726 2 12 2S5.25 5.136 5.25 9.005v.705a4.4 4.4 0 0 1-.692 2.375L3.45 13.81c-1.011 1.575-.239 3.716 1.52 4.214a25.775 25.775 0 0 0 14.06 0c1.759-.498 2.531-2.639 1.52-4.213l-1.108-1.725a4.4 4.4 0 0 1-.693-2.375Z" />
      <path
        strokeLinecap="round"
        d="M7.5 19c.655 1.748 2.422 3 4.5 3s3.845-1.252 4.5-3"
      />
    </g>
  </svg>
);
