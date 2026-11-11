/* Lab simulation photos (lab revision class with Ian Graham, 10 Nov 2026).
   Photos taken by the student at the simulation; the names are the student's own labels,
   written down from Ian at the bench (spelling fixed). Part C notes are the student's notes
   from the same class. "Check" lines are Claude's reading of a photo or note, not Ian's words.
   Photos are in img/sim/, named by the phone's file number, so a name never gives the answer. */
LAB.simGroup = { Garnierite: 'Silicate', Apatite: 'Phosphate', Epidote: 'Silicate', Cerussite: 'Carbonate', Pyrolusite: 'Oxide', Siderite: 'Carbonate', Chrysocolla: 'Silicate', Kyanite: 'Silicate' };
LAB.sim = {};

/* Part A: name the mineral in hand specimen. f = photo(s), m = the answer, n = a note shown after you answer */
LAB.sim.a = [
{f:['IMG_3961'],m:'Graphite'},
{f:['IMG_3962'],m:'Galena'},
{f:['IMG_3963'],m:'Chalcopyrite'},
{f:['IMG_3964'],m:'Arsenopyrite'},
{f:['IMG_3965'],m:'Pyrrhotite'},
{f:['IMG_3966'],m:'Azurite'},
{f:['IMG_3967'],m:'Malachite'},
{f:['IMG_3968'],m:'Sulphur'},
{f:['IMG_3969'],m:'Barite'},
{f:['IMG_3970'],m:'Fluorite',n:'The green, glassy one.'},
{f:['IMG_3971'],m:'Garnierite'},
{f:['IMG_3972'],m:'Corundum'},
{f:['IMG_3973'],m:'Cassiterite'},
{f:['IMG_3974'],m:'Molybdenite'},
{f:['IMG_3975'],m:'Bornite'},
{f:['IMG_3976'],m:'Sphalerite'},
{f:['IMG_3977'],m:'Goethite'},
{f:['IMG_3979'],m:'Magnetite'},
{f:['IMG_3980'],m:'Pyrite'},
{f:['IMG_3981'],m:'Hematite'},
{f:['IMG_3982'],m:'Talc'},
{f:['IMG_3984'],m:'Epidote'},
{f:['IMG_3985'],m:'Epidote'},
{f:['IMG_3986'],m:'Chlorite',n:'Your label: clinochlore, a chlorite (Sudoku RF 26).'},
{f:['IMG_3987'],m:'Chlorite',n:'Your label: clinochlore, a chlorite (Sudoku RF 26).'},
{f:['IMG_3988'],m:'Apatite'},
{f:['IMG_3989'],m:'Garnet'},
{f:['IMG_3990'],m:'Beryl'},
{f:['IMG_3991'],m:'Stibnite'},
{f:['IMG_3992'],m:'Pyrolusite'},
{f:['IMG_3993'],m:'Cerussite'},
{f:['IMG_3994'],m:'Magnesite'},
{f:['IMG_3995'],m:'Gypsum'},
{f:['IMG_3996'],m:'Siderite'},
{f:['IMG_3997'],m:'Chrysocolla'},
{f:['IMG_9197'],m:'Apatite'},
{f:['IMG_9198'],m:'Magnesite'},
{f:['IMG_9200'],m:'Kyanite',n:'Kyanite is not on the Mineral Sudoku sheet. Look for long blue-grey blades. It is softer along the blade than across it (general mineralogy).'},
{f:['IMG_9201'],m:'Epidote'},
{f:['IMG_9202'],m:'Cerussite'},
{f:['IMG_9203'],m:'Goethite'},
{f:['IMG_9206','IMG_9204','IMG_9205'],m:'Garnet',n:'Your label: almandine garnet (Sudoku RF 17).'},
{f:['IMG_9207','IMG_9208'],m:'Gypsum'},
{f:['IMG_9209'],m:'Magnetite',n:'The magnet pen sticks to it.'},
{f:['IMG_9210','IMG_9211'],m:'Biotite'},
{f:['IMG_9212'],m:'Quartz'},
{f:['IMG_9213'],m:'Muscovite'},
{f:['IMG_9214'],m:'Hematite'},
{f:['IMG_9215'],m:'Chrysocolla'},
{f:['IMG_9216'],m:'Chrysocolla'},
{f:['IMG_9218','IMG_9217'],m:'Siderite'},
{f:['IMG_9219'],m:'Pyrolusite'},
{f:['IMG_9220'],m:'Malachite'},
{f:['IMG_9221'],m:'Barite'},
{f:['IMG_9223'],m:'Fluorite'},
{f:['IMG_9224'],m:'Pyrrhotite'},
{f:['IMG_9225'],m:'Sphalerite'},
{f:['IMG_9226'],m:'Azurite'},
{f:['IMG_9227'],m:'Calcite'},
{f:['IMG_9228'],m:'Beryl'},
{f:['IMG_9229'],m:'Hematite',n:'Your label: coarse-grained crystalline hematite.'},
{f:['IMG_9230'],m:'Galena'},
{f:['IMG_9232','IMG_9231'],m:'Molybdenite'},
{f:['IMG_9233'],m:'Arsenopyrite'},
{f:['IMG_9234'],m:'Pyrite'},
{f:['IMG_9235'],m:'Magnetite'},
{f:['IMG_9236'],m:'Stibnite'},
{f:['IMG_9237'],m:'Apatite'},
{f:['IMG_9238'],m:'Cassiterite'},
{f:['IMG_9239'],m:'Chalcopyrite'}
];

/* Part B: name every ore mineral in the field. req = your label; opt = seen in the photo but not in your label, so not scored */
LAB.sim.b = [
{id:'8610',f:['IMG_8610'],req:['Arsenopyrite'],opt:['Pyrite'],e:'Your label: arsenopyrite. Arsenopyrite is silver-white with high reflectance, hard, and forms rhomb-shaped crystals (Lecture 4, slide 43). Check: the pale cream-yellow grains with straight edges look like pyrite to me. Your label names only arsenopyrite, so pyrite is not scored here.'},
{id:'9243',f:['IMG_9243','IMG_9242'],req:['Covellite','Pyrite','Chalcopyrite'],opt:[],e:'Your label: covellite, pyrite and chalcopyrite. Covellite is the only common blue mineral (Lecture 4, slide 51, recording). Pyrite is the pale yellow, hard grain with straight edges. Chalcopyrite is a stronger yellow and softer. Covellite that replaces the primary copper sulphides points to supergene enrichment (Lectures 2 and 11).'},
{id:'9245',f:['IMG_9245','IMG_9244'],req:['Molybdenite'],opt:[],e:'Your label: molybdenite. Lead-grey, very soft, with lamellar blades that bend. The polish is full of scratches. Strongly anisotropic, dark blue to white (Lecture 4, slide 60, recording).'},
{id:'9248',f:['IMG_9248'],req:['Hematite'],opt:[],e:'Your label: hematite. Moderate reflectance, steel-grey, strongly anisotropic, with deep red internal reflections (Lecture 4, slide 29). The phone camera makes every mineral look brighter, so judge reflectance against the other grains at the microscope.'},
{id:'9250',f:['IMG_9250'],req:['Bornite','Chalcopyrite'],opt:[],e:'Your label: bornite and chalcopyrite. Bornite is the only common pink-brown mineral; it tarnishes purple (Lecture 4, slide 45). Yellow chalcopyrite runs along fractures and edges of the bornite. Bornite with chalcopyrite is typical of porphyry Cu ore (Lectures 4 and 11).'},
{id:'9251',f:['IMG_9251','IMG_9253'],req:['Pyrite','Chalcopyrite'],opt:[],e:'Your label: pyrite and chalcopyrite. Pyrite is pale cream-yellow, hard and full of fractures. Chalcopyrite is the stronger yellow patches and is much softer (Lecture 4, slides 34 and 49).'},
{id:'9254',f:['IMG_9254','IMG_9255'],req:['Magnetite'],opt:[],e:'Your label: magnetite. Magnetite is grey with a brown tint, low reflectance, isotropic and magnetic (Lecture 4, slide 27). Check: in this photo the grey grains fit magnetite better than the bright background. The bright mineral may be a second ore mineral, or the camera has brightened the magnetite. Look again at the microscope or ask Ian.'}
];

/* Part C: name the deposit type. type = the answer; notes = what you wrote from Ian; add = from the lecture pages;
   check = Claude's reading, not Ian's words */
LAB.sim.cTypes = ['VMS', 'SEDEX', 'Magmatic Ni-Cu sulphide', 'Epithermal', 'Orogenic (mesothermal) Au', 'Porphyry Cu', 'Sn-W (granite-related)', 'CMPV (polymetallic vein)', 'Sediment-hosted Cu-Ag', 'Skarn'];
LAB.sim.cRival = { 'VMS': 'SEDEX', 'SEDEX': 'VMS', 'Epithermal': 'Orogenic (mesothermal) Au', 'Orogenic (mesothermal) Au': 'Epithermal', 'Sediment-hosted Cu-Ag': 'SEDEX', 'Sn-W (granite-related)': 'Porphyry Cu', 'Magmatic Ni-Cu sulphide': 'VMS' };
LAB.sim.c = [
{id:'A',f:['IMG_9260'],type:'VMS',link:'L10.html#mound',
 notes:['Banded sulphide: chalcopyrite, pyrrhotite','VMS, formed on the ocean floor','Temperature about 350 °C'],
 add:['Syngenetic: formed on or just under the seafloor, at the same time as the volcanic host rock (Lectures 6 and 10)','Chalcopyrite ± pyrrhotite forms in the hot core of the mound and in the stringer zone, at about 350 °C. Sphalerite and galena form at the cooler edge, about 250 down to 150 °C (Lecture 10)','Host: volcanic rock (felsic tuff, rhyolite, basalt). The footwall is altered to chlorite, sericite and silica (Lecture 10)','Setting: black smoker vents, with magma below as the heat source (Lecture 6)']},
{id:'B',f:['IMG_9261','IMG_9262'],type:'Magmatic Ni-Cu sulphide',link:'L7.html#kambalda',
 notes:['Massive sulphide, mostly pyrrhotite','Magmatic nickel sulphide deposit','Very high temperature, over 1000 °C'],
 add:['Pentlandite always comes with pyrrhotite. Some pyrrhotite is magnetic, so try the magnet (Lectures 4 and 7)','Syngenetic (magmatic): a sulphide liquid separated from the silicate magma at 1200 to 1400 °C (Lecture 7)','Massive sulphide sits at the base of the lava channel, with matrix and disseminated sulphide above it (Lecture 7)','Host: mafic to ultramafic rock, such as komatiite (Kambalda) or norite (Sudbury) (Lectures 7 and 8)']},
{id:'E',f:['IMG_9256','IMG_9257'],type:'Epithermal',link:'L14.html#ls',
 notes:['Quartz vein with dark sphalerite in it','Brecciated','Hydrothermal deposit','Temperature 100 to 200 °C'],
 add:['Epigenetic: the vein cuts the host rock, so it formed after it','A quartz vein with breccia at low temperature fits an epithermal system: shallow, from the surface down to about 3 km (Lecture 14)'],
 check:['Ian said "hydrothermal deposit". Epithermal is my reading of your notes (low temperature, quartz vein, breccia), not his words. Ask him if you can.','Dark sphalerite is iron-rich. Lecture 14 says honey-yellow (low-iron) sphalerite is the good sign for gold and silver.']},
{id:'F',f:['IMG_9258','IMG_9259'],type:'SEDEX',link:'L9.html#halo',
 notes:['Carbonaceous siltstone','SEDEX','Syngenetic / epigenetic'],
 add:['Fine laminated sphalerite, galena and pyrite parallel to the bedding, often folded with soft-sediment folds (Lectures 3 and 9)','Most SEDEX deposits, and all the large ones, are best explained as exhalative and syngenetic. Another model is early diagenetic replacement soon after burial (Lecture 9)','Brine about 80 to 200 °C, vented into a reduced sedimentary basin (Lecture 9)'],
 check:['You wrote both syngenetic and epigenetic. I think Ian was explaining the debate. At the test, write: syngenetic (exhalative), although some think it is early diagenetic replacement.']},
{id:'G',f:['IMG_9265','IMG_9266','IMG_9267'],type:'Sediment-hosted Cu-Ag',link:'L16.html#kupfer',
 notes:['Fine banded','Syngenetic','Pyrite in very fine-grained carbonaceous siltstone','Copper-silver deposit'],
 add:['Sediment-hosted Cu-Ag deposits (Kupferschiefer type) have very fine-grained, finely banded ore in carbonaceous black shale and siltstone (Lecture 16)','Ore: chalcocite, covellite, bornite, chalcopyrite, native copper and silver minerals. Zones with no ore have framboidal pyrite (Lecture 16)','Setting: continental rifts, at the redox boundary between oxidised red beds and reduced shale (Lecture 16)'],
 check:['Lecture 16 says the copper was deposited at a redox boundary and fills grain spaces, veinlets and replacements. That sounds diagenetic, not purely syngenetic. Check what Ian said.']},
{id:'H',f:['IMG_9263','IMG_9264'],type:'Sn-W (granite-related)',link:'L15.html#drill',
 notes:['Cassiterite','Quartz gangue','High up in the crust','Epigenetic'],
 add:['Dark brown to black cassiterite grains in white vein quartz, with cavities (vugs)','The granites are felsic and highly fractionated. They intruded at shallow depths, usually 1.5 to 5 km (Lecture 15)','Fluid from the granite mixed with meteoric water and deposited cassiterite, wolframite and tourmaline at 600 to 200 °C (Lecture 15)']},
{id:'I',f:['IMG_9268'],type:'Orogenic (mesothermal) Au',link:'L13.html#recipe',
 notes:['Epigenetic','Stibnite','Hydrothermal','The rocks have been foliated','Depth about 4 km'],
 add:['Foliation means the host was deformed and metamorphosed. Hydrothermal veins in deformed metamorphic rock fit an orogenic (mesothermal) system, along faults and shear zones at 200 to 700 °C and 2 to 20 km (Lecture 13)','Au-Sb (gold with stibnite) forms at shallow levels in orogenic systems; Au-As (gold with arsenopyrite) forms deeper (Lecture 13, slides 11, 14 and 15). So stibnite and about 4 km point to the shallow, cooler part.'],
 check:['Ian said hydrothermal and epigenetic. Orogenic is my reading of your notes (stibnite, foliated host, about 4 km), not his words.']}
];
