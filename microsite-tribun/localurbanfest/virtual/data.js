var APP_DATA = {
    "scenes": [{
            "id": "0-gate",
            "name": "gate",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": -0.1593056584056196,
                "pitch": 0,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                "yaw": -0.17040804327007386,
                "pitch": 0.12370975540091855,
                "rotation": 0,
                "target": "1-lobby",
            }],
            "infoHotspots": [{
                "yaw": -0.1659674002113931,
                "pitch": 0.25001777756722987,
                iframe: '<div id="arrow1" class="arrow1" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                perspective: {
                    radius: 2700,
                    extraTransforms: "rotateX(-75deg)",
                },
            }]
        },
        {
            "id": "1-lobby",
            "name": "Lobby",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": 0.022823536372237996,
                "pitch": 0.005513938346041414,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                    "yaw": -0.8147637395023625,
                    "pitch": 0.05862363501874235,
                    "rotation": 0,
                    "target": "2-art_1"
                },
                {
                    "yaw": 0.7902691659963097,
                    "pitch": 0.07597308403043002,
                    "rotation": 0,
                    "target": "6-mulmed"
                }
            ],
            "infoHotspots": [{
                    "yaw": -0.5628551036988103,
                    "pitch": 0.036679352492569706,
                    iframe: '<div class="iframe-lobby1"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/bannerbesar.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 3000,
                        extraTransforms: "rotateY(-30deg)",
                    },
                },
                {
                    "yaw": 0.6200738770990544,
                    "pitch": 0.08681794432364143,
                    iframe: '<div class="iframe-lobby2"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/bannerkecil.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 3000,
                        extraTransforms: "rotateY(40deg)",
                    },
                },
                {
                    "yaw": -0.36939679135331716,
                    "pitch": 0.0285667225993258,
                    iframe: '<a href="https://www.hp.com/id-id/shop/hp-smart-tank-615-wireless-all-in-one-y0f71a.html" data-tooltip="HP Smart Tank 615 Wireless All-in-One" target="_blank"><div id="info-1" class="info1 tool" width="100%" height="100%" data-tip="Printer HP" tabindex="1"></div></a>',
                    perspective: {
                        radius: 3000,
                        extraTransforms: "rotateY(-18deg)",
                    },
                },
                {
                    "yaw": 0.2603472660110189,
                    "pitch": -0.012986617514158638,
                    iframe: '<a href="https://www.hp.com/id-id/shop/hp-smart-tank-720-all-in-one-6uu46a.html" data-tooltip="HP Smart Tank 720 All-in-One" target="_blank"><div id="info-4" class="info1" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div></a>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(0deg)",
                    },
                },
                {
                    "yaw": -0.2362638839514588,
                    "pitch": 0.03056818515698012,
                    iframe: '<a href="https://www.hp.com/id-id/shop/hp-smart-tank-750-all-in-one-6uu47a.html" data-tooltip="HP Smart Tank 750 All-in-One" target="_blank"><div id="info-2" class="info1" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div></a>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-18deg)",
                    },
                },
                {
                    "yaw": 0.1059659545456082,
                    "pitch": 0.012575870183535898,
                    iframe: '<a href="https://www.hp.com/id-id/shop/hp-smart-tank-670-all-in-one-6uu48a.html" data-tooltip="HP Smart Tank 670 All-in-One" target="_blank"><div id="info-3" class="info1" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div></a>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(0deg)",
                    },
                },
                {
                    "yaw": -0.772882475570488,
                    "pitch": 0.12528366675290712,
                    iframe: '<div id="arrow2" class="arrow2" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-75deg)",
                    },
                },
                {
                    "yaw": 0.8126698774314001,
                    "pitch": 0.11569292259446406,
                    iframe: '<div id="arrow3" class="arrow3" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                }
            ]
        },
        {
            "id": "2-art_1",
            "name": "art_1",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": -3.1228340923904945,
                "pitch": 0.02205766305976553,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                    "yaw": -3.1358821954534974,
                    "pitch": 0.27275350398644704,
                    "rotation": 0,
                    "target": "3-art_2"
                },
                {
                    "yaw": -0.030804251137658056,
                    "pitch": 0.13391540250420064,
                    "rotation": 0,
                    "target": "1-lobby"
                }
            ],
            "infoHotspots": [{
                    "yaw": 1.1515969806943485,
                    "pitch": -0.047495166133577627,
                    iframe: '<div open-modal="art1" id="youtube" class="artboard1" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(-19deg) ",
                    },
                },
                {
                    "yaw": 1.7507674836230347,
                    "pitch": -0.033329675806450965,
                    iframe: '<div title="Artboart 2" open-modal="art2" id="youtube" class="artboard2" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(10deg)",
                    },
                },
                {
                    "yaw": 2.2535201330454537,
                    "pitch": -0.02943147400265289,
                    iframe: '<div open-modal="art3" id="youtube" class="artboard3" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(40deg)",
                    },
                },
                {
                    "yaw": 2.6653241133593424,
                    "pitch": -0.024369425749959817,
                    iframe: '<div open-modal="art4" id="youtube" class="artboard4" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-30deg)",
                    },
                },
                {
                    "yaw": -2.624176911181621,
                    "pitch": -0.00038985012113812445,
                    iframe: '<div open-modal="art5" id="youtube" class="artboard5" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(33deg)",
                    },
                },
                {
                    "yaw": -2.2110709816050065,
                    "pitch": -0.01785254861633767,
                    iframe: '<div open-modal="art6" id="youtube" class="artboard6" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-40deg)",
                    },
                },
                {
                    "yaw": -1.7310803797887715,
                    "pitch": -0.024510699083213794,
                    iframe: '<div open-modal="art7" id="youtube" class="artboard7" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-10deg)",
                    },
                },
                {
                    "yaw": -0.9430897058305998,
                    "pitch": 0.013042519681871312,
                    iframe: ' <div class="iframe-1"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/banner1920x1080.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-55deg)",
                    },
                },
                {
                    "yaw": -3.1314736712701094,
                    "pitch": 0.3802438260987451,
                    iframe: '<div id="arrow4" class="arrow4" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                }
            ]
        },
        {
            "id": "3-art_2",
            "name": "art_2",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": 3.136033825011358,
                "pitch": -0.0036759588973609425,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                    "yaw": 0.0004468656984233377,
                    "pitch": 0.292575145045749,
                    "rotation": 0,
                    "target": "2-art_1"
                },
                {
                    "yaw": -1.9902117460811404,
                    "pitch": 0.2507606659505903,
                    "rotation": 0,
                    "target": "4-art3"
                }
            ],
            "infoHotspots": [{
                    "yaw": 0.918093826595948,
                    "pitch": -0.03562297539886572,
                    iframe: '<div open-modal="example" id="youtube" class="artboard9" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-20deg)",
                    },
                },
                {
                    "yaw": 1.4203258516601398,
                    "pitch": -0.04211541214476533,
                    iframe: '<div open-modal="example" id="youtube" class="artboard10" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(16deg)",
                    },
                },
                {
                    "yaw": 2.020240529690131,
                    "pitch": -0.04886153389313819,
                    iframe: '<div open-modal="example" id="youtube" class="artboard11" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2500,
                        extraTransforms: "rotateY(40deg)",
                    },
                },
                {
                    "yaw": 2.709197316228938,
                    "pitch": -0.055268084061783185,
                    iframe: '<div open-modal="example" id="youtube" class="artboard12" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2500,
                        extraTransforms: "rotateY(-10deg)",
                    },
                },
                {
                    "yaw": -2.6643816270315774,
                    "pitch": -0.06887615901674948,
                    iframe: '<div open-modal="example" id="youtube" class="artboard13" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2400,
                        extraTransforms: "rotateY(20deg)",
                    },
                },
                {
                    "yaw": -1.4438833002982818,
                    "pitch": -0.03572077722249034,
                    iframe: '<div open-modal="example" id="youtube" class="artboard14" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2400,
                        extraTransforms: "rotateY(-15deg)",
                    },
                },
                {
                    "yaw": -0.9431352353887448,
                    "pitch": -0.03082588028137323,
                    iframe: '<div open-modal="example" id="youtube" class="artboard15" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2400,
                        extraTransforms: "rotateY(20deg)",
                    },
                },
                {
                    "yaw": -2.212814850205463,
                    "pitch": 0.008956646244934419,
                    iframe: ' <div class="iframe-4"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/banner1920x1080.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 2690,
                        extraTransforms: "rotateY(43deg)",
                    },
                },
                {
                    "yaw": -0.000327782175721495,
                    "pitch": 0.4025126005096755,
                    iframe: '<div id="arrow11" class="arrow11" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },

                },
                {
                    "yaw": -2.1037611435604816,
                    "pitch": 0.35804793973600724,
                    iframe: '<div id="arrow5" class="arrow5" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                }
            ]
        },
        {
            "id": "4-art3",
            "name": "art3",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": 1.5693356938146454,
                "pitch": -0.04800162273612685,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                    "yaw": -3.1379337581191358,
                    "pitch": 0.2561020532675986,
                    "rotation": 0,
                    "target": "5-art_4"
                },
                {
                    "yaw": -1.2918626985003279,
                    "pitch": 0.30242314899264855,
                    "rotation": 0,
                    "target": "3-art_2"
                }
            ],
            "infoHotspots": [{
                    "yaw": -0.6081217715551919,
                    "pitch": -0.05867745979188399,
                    iframe: '<div open-modal="example" id="youtube" class="artboard17" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-25deg)",
                    },
                },
                {
                    "yaw": 0.5544324621138266,
                    "pitch": -0.051117461393760166,
                    iframe: '<div open-modal="example" id="youtube" class="artboard18" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(26deg)",
                    },
                },
                {
                    "yaw": 1.3317396057572903,
                    "pitch": -0.04392123926382574,
                    iframe: '<div open-modal="example" id="youtube" class="artboard19" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(-22deg)",
                    },
                },
                {
                    "yaw": 1.9228659912221708,
                    "pitch": -0.05474247191777337,
                    iframe: '<div open-modal="example" id="youtube" class="artboard20" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(12deg)",
                    },
                },
                {
                    "yaw": 2.337776972518686,
                    "pitch": -0.021763660794251294,
                    iframe: '<div open-modal="example" id="youtube" class="artboard21" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(37deg)",
                    },
                },
                {
                    "yaw": 2.708939785642677,
                    "pitch": -0.03401047282970637,
                    iframe: '<div open-modal="example" id="youtube" class="artboard22" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(-30deg)",
                    },
                },
                {
                    "yaw": -2.6835282829853107,
                    "pitch": -0.026069751986405265,
                    iframe: '<div open-modal="example" id="youtube" class="artboard22" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(30deg)",
                    },
                },
                {
                    "yaw": -2.316060585851041,
                    "pitch": -0.02470205443751361,
                    iframe: '<div open-modal="example" id="youtube" class="artboard23" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(-35deg)",
                    },
                },
                {
                    "yaw": -1.8832921027255445,
                    "pitch": -0.05337581206455155,
                    iframe: '<div open-modal="example" id="youtube" class="artboard24" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2600,
                        extraTransforms: "rotateY(-5deg)",
                    },
                },
                {
                    "yaw": -1.0793519468186652,
                    "pitch": 0.01297161783711509,
                    iframe: ' <div class="iframe-2"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/banner1920x1080.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 2690,
                        extraTransforms: "rotateY(-60deg)",
                    },
                },
                {
                    "yaw": -3.1311225191697396,
                    "pitch": 0.3542616310598561,
                    iframe: '<div id="arrow6" class="arrow6" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                },
                {
                    "yaw": -1.2796435508369175,
                    "pitch": 0.3931203189283199,
                    iframe: '<div id="arrow12" class="arrow12" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                }
            ]
        },
        {
            "id": "5-art_4",
            "name": "art_4",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": 3.1399924409751936,
                "pitch": -0.031245650627569788,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                    "yaw": -1.9543987929268738,
                    "pitch": 0.1925152705099613,
                    "rotation": 0,
                    "target": "1-lobby"
                },
                {
                    "yaw": 0.0020711671418567335,
                    "pitch": 0.31797106603735514,
                    "rotation": 0,
                    "target": "4-art3"
                }
            ],
            "infoHotspots": [{
                    "yaw": 2.6762790964180034,
                    "pitch": -0.0398671126094321,
                    iframe: '<div open-modal="example" id="youtube" class="artboard30" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-25deg)",
                    },
                },
                {
                    "yaw": -2.6776196742756255,
                    "pitch": -0.04578377945088263,
                    iframe: '<div open-modal="example" id="youtube" class="artboard31" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(36deg)",
                    },
                },
                {
                    "yaw": -1.3916618973383272,
                    "pitch": -0.04527324514816833,
                    iframe: '<div open-modal="example" id="youtube" class="artboard32" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(16deg)",
                    },
                },
                {
                    "yaw": -0.9028437592892224,
                    "pitch": -0.032802497279426746,
                    iframe: '<div open-modal="example" id="youtube" class="artboard33" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(40deg)",
                    },
                },
                {
                    "yaw": 0.9006195249070572,
                    "pitch": -0.033936502569900995,
                    iframe: '<div open-modal="example" id="youtube" class="artboard34" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-43deg)",
                    },
                },
                {
                    "yaw": 1.3907739385899376,
                    "pitch": -0.053154030709706035,
                    iframe: '<div open-modal="example" id="youtube" class="artboard35" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(-13deg)",
                    },
                },
                {
                    "yaw": 1.9733575205121197,
                    "pitch": -0.04554191913702077,
                    iframe: '<div open-modal="example" id="youtube" class="artboard36" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateY(28deg)",
                    },
                },
                {
                    "yaw": -2.2070874893852928,
                    "pitch": 0.00995739271237639,
                    iframe: ' <div class="iframe-3"><div class="videoArea"> <video muted = "true"autoplay = "true"playsinline = "true"controls = "false"loop ><source src = "img/banner1920x1080.mp4"type = "video/mp4"/></video> <div class = "block-screen"> </div> </div> </div>',
                    perspective: {
                        radius: 2690,
                        extraTransforms: "rotateY(54deg)",
                    },
                },
                {
                    "yaw": -1.9603068519525984,
                    "pitch": 0.3000981840065595,
                    iframe: '<div id="arrow7" class="arrow7" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },

                },
                {
                    "yaw": 0.01157620783796176,
                    "pitch": 0.42164652877863595,
                    iframe: '<div id="arrow13" class="arrow13" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-65deg)",
                    },
                }
            ]
        },
        {
            "id": "6-mulmed",
            "name": "Mulmed",
            "levels": [{
                    "tileSize": 256,
                    "size": 256,
                    "fallbackOnly": true
                },
                {
                    "tileSize": 512,
                    "size": 512
                },
                {
                    "tileSize": 512,
                    "size": 1024
                }
            ],
            "faceSize": 1024,
            "initialViewParameters": {
                "yaw": -0.006714266590966744,
                "pitch": -0.0018379794486804713,
                "fov": 1.4134061960355204
            },
            "linkHotspots": [{
                "yaw": 3.138170927261414,
                "pitch": -0.2930995330049644,
                "rotation": 0,
                "target": "1-lobby"
            }],
            "infoHotspots": [{
                    "yaw": -0.02074141245524075,
                    "pitch": -0.09329980711542163,
                    iframe: '<div id="youtube" class="iframe-show"><div id="playerr"><img class="modal-toggle lazy" data-bs-toggle="modal-video" data-tagVideo="https://www.youtube.com/embed/RIM3fDMdXOg" data-bs-target="#videoModal" data-src="img/yt1.jpg"></div><div class="video-player"><div class="video-player__playing"> <div class="embed-container"><div class="video-player__thumbs"><div class="video-thumb active modal-toggle" data-bs-toggle="modal-video" data-tagVideo="https://www.youtube.com/embed/RIM3fDMdXOg" data-bs-target="#videoModal"><img class="lazy" data-src="img/yt-1.jpg"></div><div class="video-thumb modal-toggle" data-bs-toggle="modal-video" data-tagVideo="https://www.youtube.com/embed/ouMXkz7IR6M" data-bs-target="#videoModal"><img class="lazy" data-src="img/yt-2.jpg"></div><div  class="video-thumb modal-toggle" data-bs-toggle="modal-video" data-tagVideo="https://www.youtube.com/embed/DZVNhV3zHd0" data-bs-target="#videoModal"><img class="lazy" data-src="img/yt-3.jpg"></div><div class="video-thumb modal-toggle" data-bs-toggle="modal-video" data-tagVideo="https://www.youtube.com/embed/_NN6-M11DjU" data-bs-target="#videoModal"><img class="lazy" data-src="img/yt-4.jpg"></div></div></div></div>',
                    perspective: {
                        radius: 2750,
                        extraTransforms: "rotateX(9.2deg)",
                    },
                },
                {
                    "yaw": -3.1218104592885876,
                    "pitch": 0.23975466113391875,
                    iframe: '<div id="arrow8" class="arrow8" width="100%" height="100%" src="" frameborder="0" allowfullscreen></div>',
                    perspective: {
                        radius: 2700,
                        extraTransforms: "rotateX(-70deg)",
                    },
                }
            ]
        }
    ],
    "name": "Project Title",
    "settings": {
        "mouseViewMode": "drag",
        "autorotateEnabled": true,
        "fullscreenButton": true,
        "viewControlButtons": false
    }
};