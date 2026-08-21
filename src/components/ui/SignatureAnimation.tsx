"use client";

import { motion, useTransform, useMotionValue } from "framer-motion";

export function SignatureAnimation({ 
  className = "", 
  progress, 
  trigger = true, 
  delay = 0 
}: { 
  className?: string; 
  progress?: any; 
  trigger?: boolean; 
  delay?: number; 
}) {
  // Animasi beruntun (sequential drawing) untuk setiap stroke tanda tangan
  const pathVariants: any = progress ? undefined : {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: delay + i * 0.65, duration: 1.8, ease: [0.22, 1, 0.36, 1] },
        opacity: { delay: delay + i * 0.65, duration: 0.15 },
      },
    }),
  };

  const defaultProgress = useMotionValue(1);
  const activeProgress = progress || defaultProgress;

  // Sequential drawing saat terikat ke progress (Loading Screen & animasi Zoom Out Card)
  const stroke0Progress = useTransform(activeProgress, [0, 0.38], [0, 1]);
  const stroke0Opacity = useTransform(activeProgress, [0, 0.01], [0, 1]);

  const stroke1Progress = useTransform(activeProgress, [0.32, 0.72], [0, 1]);
  const stroke1Opacity = useTransform(activeProgress, [0, 0.32, 0.33], [0, 0, 1]);

  const stroke2Progress = useTransform(activeProgress, [0.65, 1], [0, 1]);
  const stroke2Opacity = useTransform(activeProgress, [0, 0.65, 0.66], [0, 0, 1]);

  // Sembunyikan SVG sepenuhnya pada saat progress = 0 untuk menghindari titik bulat (round cap)
  const svgOpacity = useTransform(activeProgress, [0, 0.005, 1], [0, 1, 1]);

  return (
    <div className={`pointer-events-none ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="-40 -40 1026 917"
        overflow="visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={progress ? undefined : "hidden"}
        animate={progress ? undefined : (trigger ? "visible" : "hidden")}
        style={progress ? { opacity: svgOpacity } : {}}
        // Warna akan mengikuti teks warna parent karena stroke="currentColor"
      >
        <motion.path
          d="M281.555 56.4519C280.702 60.2918 279.849 64.1316 278.342 74.2161C276.836 84.3006 274.703 100.513 251.632 192.489C228.56 284.464 184.615 451.711 156.004 551.522C127.392 651.332 115.446 678.637 108.865 694.197C102.284 709.757 101.431 712.744 99.2591 717.114"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="round"
          variants={progress ? undefined : pathVariants}
          initial={progress ? { pathLength: 0, opacity: 0 } : undefined}
          style={progress ? { pathLength: stroke0Progress, opacity: stroke0Opacity } : {}}
          custom={0}
        />
        <motion.path
          d="M1.00018 210.305C1.85349 205.586 8.70577 192.721 36.1794 165.83C47.7065 154.547 68.6954 143.333 98.2183 128.42C127.741 113.507 166.566 96.8674 219.633 79.3359C272.699 61.8044 338.83 43.8851 397.643 30.6008C456.456 17.3164 505.947 9.21008 553.202 5.03408C600.457 0.858078 643.975 0.858079 667.46 1.0714C690.946 1.28473 693.079 1.71138 694.178 3.85109C696.955 9.25921 691.437 33.4128 678.579 75.0952C671.555 97.8653 655.482 121.044 636.496 146.152C617.51 171.26 594.044 196.859 563.183 223.699C532.322 250.539 494.777 277.845 451.116 302.791C407.456 327.737 358.818 349.496 300.91 369.238C243.001 388.981 177.297 406.047 107.016 424.923"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="round"
          variants={progress ? undefined : pathVariants}
          initial={progress ? { pathLength: 0, opacity: 0 } : undefined}
          style={progress ? { pathLength: stroke1Progress, opacity: stroke1Opacity } : {}}
          custom={1}
        />
        <motion.path
          d="M110.895 701.599C110.895 702.452 110.895 707.158 112.175 712.77C113.033 716.53 121.212 705.529 126.817 699.026C135.327 689.152 155.68 688.205 169.236 687.17C182.424 686.164 195.346 678.34 197.932 679.174C200.111 679.877 198.811 686.834 199.877 689.052C201.323 692.056 207.408 687.817 211.067 687.591C212.714 687.489 213.446 690.351 214.952 691.45C218.024 693.691 225.91 689.989 233.667 688.03C236.29 687.368 236.304 692.471 237.371 694.023C241.48 700 253.913 689.11 265.575 686.084C267.456 685.596 267.333 690.325 271.6 689.31C275.866 688.295 284.399 682.749 289.009 681.598C293.618 680.448 294.044 683.861 296.824 684.766C304.374 687.224 312.132 680.926 315.791 680.48C317.516 680.269 318.17 684.3 320.956 685.625C336.74 693.133 350.918 679.633 354.15 680.254C356.306 680.668 355.249 687.274 356.743 689.058C364.291 698.077 386.589 676.207 403.041 668.004C405.421 666.816 406.939 669.665 423.171 646.871C439.403 624.078 470.548 576.293 488.513 549.543C509.65 518.069 515.98 511.572 517.926 510.466C519.208 509.738 516.885 517.467 503 549.763C489.114 582.059 462.662 640.937 447.968 671.481C433.275 702.026 431.141 702.452 430.042 698.619C428.943 694.786 428.943 686.679 430.65 681.01C435.945 663.419 464.136 656.84 485.119 651.836C489.265 650.848 492.657 649.056 495.482 647.964C498.306 646.871 500.44 646.445 498.765 653.265C493.494 674.739 486.684 691.23 489.683 695.109C493.178 699.629 503.452 693.868 510.99 688.709C520.201 682.405 520.298 671.475 522.024 664.758C525.721 650.372 520.764 705.348 507.68 744.044C501.301 762.91 487.382 792.359 479.295 810.304C471.208 828.25 468.221 833.369 466.043 834.727C463.864 836.084 462.584 833.525 462.778 829.006C463.253 817.934 470.277 801.681 482.281 776.573C489.76 760.931 502.819 740.799 515.592 722.783C539.716 688.758 561.179 669.755 572.376 661.791C582.799 654.377 591.795 649.47 599.791 643.872C601.711 642.528 603.87 641.713 603.049 641.06C593.559 633.512 579.823 641.247 564.34 650.479C540.27 664.83 538.011 679.555 535.399 689.679C533.53 696.925 550.435 695.135 557.533 694.495C572.781 693.12 590.89 675.354 604.09 666.724C606.791 664.958 608.188 662.425 609.068 659.193C609.947 655.96 609.947 651.694 609.947 659.949C609.947 668.204 609.947 689.11 610.16 697.533C610.373 705.956 610.8 701.263 615.713 676.659C620.626 652.056 630.012 607.684 641.674 569.68C653.336 531.676 666.989 501.384 677.648 479.379C694.714 444.151 703.887 428.401 705.607 425.369C707.288 422.405 707.779 440.347 699.026 485.281C691.966 521.525 674.487 583.973 660.589 629.295C646.69 674.617 635.597 700.642 628.816 712.77C622.035 724.897 619.902 722.337 618.376 719.738C615.5 714.839 615.545 705.116 617.258 692.639C618.685 682.247 625.862 674.061 636.36 663.116C672.913 625.011 703.874 619.721 707.96 620.354C710.155 620.695 711.619 623.975 712.285 626.573C712.95 629.172 712.524 631.732 711.451 633.904C709.337 638.182 699.66 643.807 681.417 653.898C636.875 678.537 619.074 686.912 613.166 692.103C611.308 693.735 622.307 693.402 638.836 690.422C655.366 687.442 681.391 681.042 733.837 677.105C786.283 673.169 864.36 671.889 944.803 670.57"
          stroke="currentColor"
          strokeWidth="40"
          strokeLinecap="round"
          variants={progress ? undefined : pathVariants}
          initial={progress ? { pathLength: 0, opacity: 0 } : undefined}
          style={progress ? { pathLength: stroke2Progress, opacity: stroke2Opacity } : {}}
          custom={2}
        />
      </motion.svg>
    </div>
  );
}
