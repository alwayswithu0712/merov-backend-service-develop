
const commonAttrs = {
    shippingCost: 0,
    weight: 1,
    length: 1,
    width: 1,
    height: 1,
    weightUnit: 'kg',
    dimensionsUnit: 'cm',
    published: true,
    approved: true,
}

export const products = [
    {
        ...commonAttrs,
        title: 'AMD Ryzen Threadripper 3970X 32',
        description:
            'An astonishing 32 cores and 64 processing threads for serious designers and artists Incredible 4. 5 GHz max boost frequency, with a huge 144MB cache Unlocked, with new automatic overclocking feature Quad-Channel DDR4 and 88 total PCIe 4. 0 lanes 280W TDP, Cooler not Included. OS Support : Windows 10 - 64-Bit Edition, RHEL x86 64-Bit, Ubuntu x86 64-Bit',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/81D-WvtG6OL._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/51Dq1EQimnL._AC_SL1002_.jpg',
        ],
        condition: 'New',
        stock: 10,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'AMD Ryzen 9 3950X 16-Core',
        description:
            "6 Cores and 32 processing threads, The most processing power you can get in mainstream desktop Can deliver ultra-fast 100+ FPS performance in the world's most popular gamesCooler not included, Liquid cooler with 280 millimeter or larger radiator recommended. Max Temps:95°C 4.7 GHz max Boost, unlocked for overclocking, 72 MB of game cache, ddr-3200 support For the advanced socket AM4 platform, can support PCIe 4.0 on x570 motherboards Base Clock-3.5GHz,Total L1 Cache-1 MB,Total L2 Cache-8 MB, CMOS-TSMC 7nm FinFET, PCI express version-PCIe 4.0 x16. OS Support-Windows 10 - 64-Bit Edition, RHEL x86 64-Bit, Ubuntu x86 64-Bit. Operating System (OS) support will vary by manufacturer",
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61LQ1nNL-eL._AC_SL1198_.jpg'],
        condition: 'New',

        stock: 10,
        featured: true,
    },
    {
        ...commonAttrs,
        title: '2021 Apple MacBook Pro (14-inch, Apple M1 Pro chip',
        description:
            'Apple M1 Pro or M1 Max chip for a massive leap in CPU, GPU, and machine learning performanceUp to 10-core CPU delivers up to 3.7x faster performance to fly through pro workflows quicker than ever Up to 32-core GPU with up to 13x faster performance for graphics-intensive apps and games16-core Neural Engine for up to 11x faster machine learning performanceLonger battery life, up to 17 hoursUp to 64GB of unified memory so everything you do is fast and fluid',
        price: 10,
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb9856219'],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'NX102-1120 NX102 Database Connection CPU Unit ',
        description:
            'Brand Name PLCHAPPY Ean 7693808586116 Model Number	NX102-1120 Number of Items	1Part Number	NX102-1120UNSPSC Code	43000000',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/41zE6s7cr8L.jpeg'],
        condition: 'Used',
        stock: 1,
    },
    {
        ...commonAttrs,
        title: 'WWWFZS Graphics cardFit for Colorful Igame Geforce RTX 3090 Neptune OC -V ',
        description:
            'Memory Capacity: 24GB.Application: DesktopInterface Type: PCI Express 4.0 x 16 Memory Capacity: 24GB.Application: DesktopInterface Type: PCI Express 4.0 x 16With Its Fresh Design,Protective Backplate Secures Components During Transportation And Installation.Esports Gaming tested with major titles like League of Legends, Over watch and Player Unknowns BattlegroundsStrong back plate support designed to reinforce circuit boar',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb9856209',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb985620a',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb985620b}',
        ],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'Mining Rig Frame for 12GPU',
        description:
            'SLOT - 6/8/12 GPU slots, support 2 ATX power supplies.MATERIAL - The open air mining frame case made up of the highest quality stainless steel material, strong, durable and available. Fully protecting your GPU and eectronic device.PERFECT DESIGN - Professional design for mining rig frame, accelerating the air convection, super cooling design for heat dissipation. Enough space reserved between the graphics cards.EASY TO INSTALL - Easy to install and strong structure. Keep all cables clean and organized, along with everything in your mining machine.NEED TO ASSEMBLE BY YOURSELF - For installation steps, please refer to the user manual. The Frame Only, Not includes Fans or other CPU, GPU, PSU, Motherboards, Cables. If you are not 100% satistifed with this Miner, please feel free to contact us, we will offer you a satisfactory soluiton within 24 hours.',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb985620e',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb985620f',
        ],
        condition: 'Used',
        stock: 15, 
    },
    {
        ...commonAttrs,
        title: 'Bitmain Antminer L7 9500MH/s',
        description:
            'Bitmain Antminer L7 is a New improved Bitcoin Mining Hardware with Hash Rate 9500MH/sGeneric AntMiner Power on wall @25°C, WattPower supply required input voltage for L7 is 220V. Antminer L7 is most powerful bitcoin miner , much better than others BTC mining machines.L7 Miner Size 370*195.5*290 and Net weight 15kg.',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb9856212'],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'MAXSUN GEFORCE GT 1030 2GB GDDR5 Video Graphics Card GPU Mini',
        description:
            'Silver plated PCB & all solid capacitors provide lower temperature, higher efficiency & stability\n9CM unique fan provide low noise and huge airflow\nITX size perfect in any case, 3x Faster Than GeForce GT 730 & Dual Monitor Support via HDMI & DVI-D\nBoost Clock / Memory Speed : up to 1468 MHz / 2GB GDDR5 64 bit / 6000 MHz Memory\nSupport PhysX physics acceleration technology, NVIDIA CUDA, PureVideo HD 4K hardware decoding, dynamic super-resolution, MFAA, GeForce 3D Vision, GameWorks, G-Sync-Ready,',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/b1735cf3515dd6c122d763400',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/b1735cf3515dd6c122d763401',
        ],
        condition: 'new, unboxing',
        stock: 20,
    },
    {
        ...commonAttrs,
        title: 'MSI Stealth GS77 -17 Gaming & Entertainment Laptop',
        description:
            '【Upgraded】 Seal is opened for Hardware/Software upgrade only to enhance performance. 17.3" 4K Ultra HD (3840x2160) 120Hz Refresh Rate IPS Display; Wi-Fi 6E AX1675, Bluetooth 5.2, Ethernet LAN (RJ-45), 1080p Full HD Webcam, Fingerprint Security System, Per Key RGB Backlit, .【High Speed and Multitasking】 64GB DDR5 SODIMM; 240W Power Supply, 4-Cell 99 WHr Battery; Core Black Color, 【Enormous Storage】 2x8TB PCIe NVMe SSD RAID 0 (16TB available storage); HDMI (upto 4K(3840 x 2160) at 60Hz), Thunderbolt 4 (Type-C), USB 3.2 Type-C Gen2, SD Reader, No Optical Drive, 1 x Headphone/Microphone Combo Jack., Windows 11 Pro-64., 1 Year Manufacturer warranty from GreatPriceTech (Professionally upgraded by GreatPriceTech)',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/71p3Ygm14wL._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61NsoeiRyIS._AC_SL1000_.jpg',
        ],
        condition: 'New', 
        stock: 20,
    },
    {
        ...commonAttrs,
        title: 'Lenovo ThinkVision M14 14" Full HD 1920x1080',
        description:
            '14" Fhd 1920 x 1080 IPS16. 7 million colors, 300 nit typical, 6ms with old - 60 Hz refresh2 x USB Type-C ports that supports DisplayPort 1. 2 Alt Mode and Pd2. 0Low Blue Light Technology, Kensington lock slotTilt adjustable, weight 1. 26 pounds',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/7d4e560575aee515eb9856218'],
        condition: 'Almost New',
        stock: 4,
    },
    {
        ...commonAttrs,
        title: 'GoPro HERO10 Black',
        description:
            'REVOLUTIONARY PROCESSOR: Faster. Smoother. Better. The powerful new GP2 engine changes the game—snappy performance, responsive touch controls and double the frame rate for amazingly smooth footage. Designed specifically for the demanding nature of the GoPro, the GP2 “system',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/812B%2B24foNL._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/81-ANIzKM9L._AC_SL1500_.jpg',
        ],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'HP Z6 G4 Silver 4110 8C 2.1Ghz 32GB RAM 1TB',
        description: '2.1Ghz Eight Core Silver 4110 CPU32GB of ECC DDR4 RAM1TB NVMe M.2 SSD',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61ffQW2o-SL._AC_SL1000_.jpg'],
        condition: 'New',
        stock: 20,
    },
    {
        ...commonAttrs,
        title: 'HP Z6 G4 Workstation - Intel Xeon Silver 4108 8-Core 1.8Ghz - 192GB DDR4 REG',
        description: 'Specific Uses For Product	BusinessRam Memory Installed Size	2 GBOperating System	Windows 10CPU Model	Intel XeonBrand	HP',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/41Z0YOKoTIS._AC_.jpg'],
        condition: 'New',
        stock: 50,
    },
    {
        ...commonAttrs,
        title: 'ASUS ROG Strix NVIDIA GeForce RTX 3070 Ti OC',
        description:
            'NVIDIA Ampere Streaming Multiprocessors: The building blocks for the world’s fastest, most efficient GPU, the all-new Ampere SM brings 2X the FP32 throughput and improved power efficiency.',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/91V%2Bjq4ixES._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/818LcFd42hS._AC_SL1500_.jpg',
        ],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'XiaoAli cooperate with Bitmain,Bransd New Asic',
        description:
            '[High hash-rate but high efficiency] Antminer s19 95TH shipped by FBA, which is the powerful asic bitcoin miner. The fastest arrival in 3-5 days. Antminer S19 95T mining hardware with 95Thash/s (± 5%) computer power, energy consumption is 3200W(+/- 5%)  The power consumption ratio is 34.5J/TH',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/513xPAfT1LL._AC_SL1000_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/419OhoPOHYS._AC_.jpg',
        ],
        condition: 'New',
        stock: 10,
    },
    {
        ...commonAttrs,
        title: 'Samsung Galaxy Z Fold 2 5G | Factory',
        description:
            'Refined 2-in-1 Design: A new, revolutionary mobile experience with on-demand expansive viewing, seamless interactivity, and cinematic infinity displays; Folded, it’s a cell phone – unfolded, it’s a tabletAdaptive Flex Mode: Capture hands-free photos and videos from any angle, and control Android apps by using both halves of the large display; Preview on one half and video chat, record, browse, edit, and more on the other screen',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/71K7LHNK7DL._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/71dxkDMXcZL._AC_SL1500_.jpg',
        ],
        condition: 'New',
        stock: 15,
    },
    {
        ...commonAttrs,
        title: 'Feilx Smart Watch for Android iOS',
        description:
            '➤ Amazing Vivid Display ➤ The 1.6" touch screen display, 400*400, multi UI switching, makes it clear and intuitive to understand your health and sports data. IP67 Waterproof.➤ Best Watch for Your Health ➤ Our fitness tracker health watch with GPS fubction,Bluetooth Call,4+128G memory, Heart rate monitoring,high pixel dual camera, multiply sports modes advantage also has Information reminder. With this fitness activity smartwatch, you can have a healthier and more energetic life.',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61oLrtuDsTL._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61qvqjOYTQL._AC_SL1500_.jpg',
        ],
        condition: 'New',
        stock: 15,
    },
    {
        ...commonAttrs,
        title: 'NVIDIA Titan RTX Graphics Card',
        description:
            'OS Certification : Windows 7 (64 bit), Windows 10 (64 bit) (April 2018 Update or later), Linux 64 bit4608 NVIDIA CUDA cores running at 1770 MegaHertZ boost clock; NVIDIA Turing architecture',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/71OpiCVK%2B0L._AC_SL1500_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61PTsFguWGL._AC_SL1500_.jpg',
        ],
        condition: 'New',
        stock: 15,
    },
    {
        ...commonAttrs,
        title: 'PNY GeForce RTX™ 3070 Ti 8GB XLR8 Gaming',
        description:
            'NVIDIA Ampere architecture, with 1575MHz core clock and 1770MHz boost clock speeds to help meet the needs of demanding games.8GB GDDR6X (256-bit) on-board memory, plus 6144 CUDA processing cores and up to 608GB/sec of memory bandwidth provide the memory needed to create striking visual realism.',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/61AIyws526S._AC_SL1000_.jpg',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/51S4Bq%2B97qS._AC_SL1000_.jpg',
        ],
        condition: 'Almost New',
        stock: 15,
    },
];

export const productsJsbit = [
    {
        ...commonAttrs,
        title: 'Bitmian Antminer S19j Pro 100t Bitcoin Miner Mining Crypto Machine',
        description:
            'Antminer S19 Pro 100 TH/s is one of the best miners produced by Bitmain Technology Company.The Coin Miner LLC Mining Company offers this device for interested users for profitable Bitcoin mining.When looking for a crypto mining hardware providing company, we have found AsicminerMarket to be fair and transparent. They offer affordable and profitable mining hardware and have over time proven its reliability.',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e17',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e18',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e19',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'Innosilicon T3+ 57t Asic Miner For Ethereum Crypto Mining Rig',
        description:
            "The Innosilicon T3+ SHA-256 57 TH/s is a Bitcoin miner with powerful built-in industry-leading T3+ ASIC technology. It has improved efficiency and durability, it's effortless and profitable for Bitcoin mining.Innosilicon provides high-performance PHYs and mixed-signal IP. Innosilicon supports TSMC, SMIC, and GF processes from 180nm to 14nm and still producing more advanced ASIC miners to improve the blockchain technology.",
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e14',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e15',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e16',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'MicroBT WhatsMiner M30S+ 100T Profitability High 34W BTC Asic Miner',
        description:
            'Model Whatsminer M30S+ is a front-runner ASIC developed and created by the Shenzhen- based MicroBT. This miner holds an impressive hashrate of 100 Th/s for a power consumption of 3400w. Capable of a hundred tare hash per second and literally the fastest machine aroundMicroBT Whatsminer M30S+ miner that can produce at a maximum of 100 TH/s hash rate with 3.4 KW power consumption. BitcoinSV, LitecoinCash, DGB-SHA, BitcoinCashABC, Peercoin, Bitcoin, and Myriad-SHA miner compatible with SHA-256 hashing algorithm.',

        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e12',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/c2e08ee3c5db5b3ff4b1b9e13',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
];

export const productsHome = [
    {
        ...commonAttrs,
        title: 'NVIDIA Quadro RTX 8000',
        description:
            'Graphics processor: NVIDIA Quadro RTX 8000 Graphics memory: 48 GB GDDR6 System interface: PCI-Express 3.0 X16 Four DisplayPort 1.4 connectors NVIDIA View Desktop Management Software',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec115',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec104',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'PNY NVIDIA Quadro RTX A6000 48GB GDDR6 Graphics Card',
        description:
            'Memory: 48GB, GDDR6 PCI Express x16 4.0 interface Maximum resolution: 7680 x 4320 pixels Ports: 4 x DisplayPorts Backed by a 3 years manufacturers warranty',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec106',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec105',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec107',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'MicroBT WhatsMiner M30S+ 100T Profitability High 34W BTC Asic Miner',
        description:
            'Brand ASUS Graphics Coprocessor NVIDIA GeForce RTX 3090 Video Output Interface DisplayPort, HDMI Chipset Brand NVIDIA Graphics RAM Type GDDR6',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec108',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec109',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec10a',
        ],
        condition: 'New',
        stock: 20,
    },
    {
        ...commonAttrs,
        title: 'INTEL BX806738180 INTEL XEON PLATINUM 8180',
        description: 'CPU Manufacturer Intel CPU Model Quad Core Xeon CPU Speed 2.5 GHz Wattage 205 watts Cache Size 38.5',
        images: ['https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec10b'],
        condition: 'New',
        stock: 20,
    },
    {
        ...commonAttrs,
        title: 'Intel BX80673I97980X Core i9-7980XE Processors',
        description:
            'Socket LGA 2066 Compatibale with Intel X299 Chipset 18 Cores/36 Threads Intel Turbo Boost Max Technology 3.0 up to 4.40GHz Intel Optanememory ready and support for Intel OptaneSSDs',
        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec10d',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec10e',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec10f',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
    {
        ...commonAttrs,
        title: 'Acer Predator Triton 500 SE Gaming/Creator Laptop | 12th Gen Intel i9-12900H',
        description:
            'Extreme Performance: Compete or create with impressive power and speed of the 12th Generation Intel Core i9-12900H processor, featuring 14 cores and 20 threads to divide and conquer any creative task or run your most intensive games RTX, Its On: The latest NVIDIA GeForce RTX 3080 Ti (16GB dedicated GDDR6 VRAM) is powered by award-winning Ampere architecture with NVIDIA Advanced Optimus, Ray Tracing Cores, Tensor Cores, and streaming multiprocessors supporting DirectX 12 Ultimate for the ultimate gaming performance Blazing-Fast Display: This 16" WQXGA (2560 x 1600) DCI-P3 100% IPS LED-backlit NVIDIA G-SYNC display featuring 16:10 aspect ratio, an incredibly fast 240Hz refresh rate and 500 nit brightness for the gamer or creator who demands the best visual experiences',

        images: [
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec110',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec111',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec112',
            'https://merov-dev-product-images.s3.us-east-2.amazonaws.com/855134982975cdee4886ec113',
        ],
        condition: 'New',
        stock: 20,
        featured: true,
    },
];
