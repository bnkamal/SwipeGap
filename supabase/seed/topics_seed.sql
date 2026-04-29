-- ============================================================
-- SwipeGap — Topic Seed Data (50 topics)
-- File: /supabase/seed/topics_seed.sql
-- Run this THIRD in Supabase SQL Editor
-- ============================================================

INSERT INTO topics (subject, grade, curriculum, exam_tag, title, hint, subtopics) VALUES

-- ── HSC MATHEMATICS (NSW, Year 11-12) ────────────────────────
('Mathematics','Year 11','AU-NSW','HSC',
 'Functions and Graphs','Understanding how to plot, read and interpret different types of mathematical functions',
 ARRAY['Domain and range','Linear functions','Quadratic functions','Transformations']),

('Mathematics','Year 12','AU-NSW','HSC',
 'Calculus — Differentiation','Finding the rate of change of a function using derivative rules',
 ARRAY['First principles','Chain rule','Product rule','Quotient rule']),

('Mathematics','Year 12','AU-NSW','HSC',
 'Calculus — Integration','Finding the area under a curve using antiderivatives and definite integrals',
 ARRAY['Antiderivatives','Definite integrals','Area between curves','Trapezoidal rule']),

('Mathematics','Year 12','AU-NSW','HSC',
 'Trigonometry','Using sine, cosine and tangent in right triangles and the unit circle',
 ARRAY['SOHCAHTOA','Sine rule','Cosine rule','Radians','Trig identities']),

('Mathematics','Year 12','AU-NSW','HSC',
 'Exponentials and Logarithms','Working with exponential functions and their inverse logarithms',
 ARRAY['Laws of logarithms','Natural log','Exponential growth','e^x derivatives']),

-- ── HSC ENGLISH (NSW, Year 11-12) ────────────────────────────
('English','Year 11','AU-NSW','HSC',
 'Textual Analysis','Identifying and explaining how language techniques create meaning in texts',
 ARRAY['Figurative language','Tone and mood','Structure','Point of view']),

('English','Year 12','AU-NSW','HSC',
 'Essay Writing','Planning and writing a sustained, analytical response to a text',
 ARRAY['Thesis statement','PEEL paragraphs','Textual evidence','Coherence']),

('English','Year 12','AU-NSW','HSC',
 'Module B — Close Study of Literature','Analysing how craft choices shape meaning in a prescribed text',
 ARRAY['Language features','Imagery','Characterisation','Context']),

-- ── HSC CHEMISTRY (NSW, Year 11-12) ──────────────────────────
('Chemistry','Year 11','AU-NSW','HSC',
 'Atomic Structure','Understanding the composition of atoms and how the periodic table is organised',
 ARRAY['Protons neutrons electrons','Electron configuration','Isotopes','Periodic trends']),

('Chemistry','Year 12','AU-NSW','HSC',
 'Chemical Equilibrium','Predicting how changes to conditions affect reversible reactions',
 ARRAY['Le Chatelier''s principle','Equilibrium constant','Ksp','ICE tables']),

('Chemistry','Year 12','AU-NSW','HSC',
 'Acids and Bases','Understanding pH, strong vs weak acids and buffer solutions',
 ARRAY['Bronsted-Lowry theory','pH calculations','Titrations','Buffer solutions']),

('Chemistry','Year 12','AU-NSW','HSC',
 'Organic Chemistry','Identifying and naming carbon-based compounds and their reactions',
 ARRAY['Hydrocarbons','Functional groups','Addition reactions','Condensation polymers']),

-- ── HSC PHYSICS (NSW, Year 11-12) ────────────────────────────
('Physics','Year 11','AU-NSW','HSC',
 'Kinematics','Describing the motion of objects using displacement, velocity and acceleration',
 ARRAY['SUVAT equations','Projectile motion','Velocity-time graphs','Relative motion']),

('Physics','Year 12','AU-NSW','HSC',
 'Electricity and Magnetism','Understanding electric fields, circuits and electromagnetic induction',
 ARRAY['Coulomb''s law','Electric fields','Ohm''s law','Faraday''s law']),

('Physics','Year 12','AU-NSW','HSC',
 'Waves and Thermodynamics','Properties of waves, sound, light and heat transfer',
 ARRAY['Wave equation','Doppler effect','Standing waves','Specific heat capacity']),

-- ── SELECTIVE / OC TEST (NSW) ────────────────────────────────
('Mathematics','Year 6','AU-NSW','Selective',
 'Fractions and Decimals','Converting between fractions, decimals and percentages and performing operations',
 ARRAY['Adding fractions','Multiplying decimals','Percentages','Mixed numbers']),

('Mathematics','Year 6','AU-NSW','Selective',
 'Ratio and Proportion','Comparing quantities and solving rate and ratio problems',
 ARRAY['Simplifying ratios','Dividing in a ratio','Direct proportion','Unit rates']),

('Mathematics','Year 4','AU-NSW','OC',
 'Number Patterns','Identifying and continuing sequences using rules',
 ARRAY['Addition patterns','Multiplication sequences','Number machines','Skip counting']),

('English','Year 6','AU-NSW','Selective',
 'Reading Comprehension','Understanding, interpreting and analysing written passages',
 ARRAY['Main idea','Inference','Vocabulary in context','Author''s purpose']),

('General Ability','Year 6','AU-NSW','Selective',
 'Logical Reasoning','Solving problems using patterns, sequences and spatial reasoning',
 ARRAY['Analogies','Pattern completion','Visual reasoning','Syllogisms']),

-- ── IIT JEE PHYSICS (Class 11-12) ────────────────────────────
('Physics','Class 11','IN-CBSE','JEE',
 'Newton''s Laws of Motion','Applying forces and understanding inertia, acceleration and action-reaction',
 ARRAY['Free body diagrams','Friction','Circular motion','Conservation of momentum']),

('Physics','Class 12','IN-CBSE','JEE',
 'Electrostatics','Coulomb''s law, electric fields, potential and capacitors',
 ARRAY['Gauss''s law','Electric potential','Capacitance','Dielectrics']),

('Physics','Class 12','IN-CBSE','JEE',
 'Optics','Reflection, refraction, lenses and wave optics',
 ARRAY['Snell''s law','Lens formula','Interference','Diffraction']),

('Physics','Class 11','IN-CBSE','JEE',
 'Work, Energy and Power','Energy conservation, kinetic and potential energy calculations',
 ARRAY['Work-energy theorem','Conservative forces','Elastic collisions','Power']),

('Physics','Class 12','IN-CBSE','JEE',
 'Modern Physics','Photoelectric effect, Bohr model and nuclear physics basics',
 ARRAY['Photoelectric effect','de Broglie wavelength','Radioactive decay','Nuclear binding energy']),

-- ── IIT JEE CHEMISTRY (Class 11-12) ──────────────────────────
('Chemistry','Class 11','IN-CBSE','JEE',
 'Chemical Bonding','Understanding ionic, covalent and metallic bonds and molecular geometry',
 ARRAY['VSEPR theory','Hybridisation','Polarity','Hydrogen bonding']),

('Chemistry','Class 12','IN-CBSE','JEE',
 'Electrochemistry','Redox reactions, electrochemical cells and corrosion',
 ARRAY['Standard electrode potentials','Nernst equation','Electrolysis','Galvanic cells']),

('Chemistry','Class 11','IN-CBSE','JEE',
 'Thermodynamics','Enthalpy, entropy and Gibbs free energy in chemical reactions',
 ARRAY['First law of thermodynamics','Hess''s law','Entropy','Spontaneity']),

('Chemistry','Class 12','IN-CBSE','JEE',
 'Coordination Chemistry','Metal complexes, ligands and IUPAC nomenclature',
 ARRAY['Ligands and denticity','Crystal field theory','Isomerism','Colour in complexes']),

-- ── IIT JEE MATHEMATICS (Class 11-12) ────────────────────────
('Mathematics','Class 11','IN-CBSE','JEE',
 'Sequences and Series','Arithmetic and geometric progressions and their sums',
 ARRAY['AP sum formula','GP common ratio','Infinite GP','AM-GM inequality']),

('Mathematics','Class 12','IN-CBSE','JEE',
 'Integral Calculus','Definite and indefinite integrals with applications',
 ARRAY['Integration by parts','Substitution','Area under curve','Differential equations']),

('Mathematics','Class 12','IN-CBSE','JEE',
 'Coordinate Geometry','Lines, circles, parabolas, ellipses and hyperbolas',
 ARRAY['Conic sections','Tangent and normal','Chord of contact','Pair of tangents']),

('Mathematics','Class 11','IN-CBSE','JEE',
 'Permutations and Combinations','Counting principles for arrangements and selections',
 ARRAY['Factorial notation','nPr formula','nCr formula','Binomial theorem']),

('Mathematics','Class 12','IN-CBSE','JEE',
 'Matrices and Determinants','Operations on matrices and solving systems of equations',
 ARRAY['Matrix multiplication','Determinant','Inverse matrix','Cramer''s rule']),

-- ── CBSE CLASS 10 SCIENCE ─────────────────────────────────────
('Science','Class 10','IN-CBSE','CBSE',
 'Chemical Reactions','Types of chemical reactions and how to identify and balance equations',
 ARRAY['Combination reactions','Decomposition','Displacement reactions','Balancing equations']),

('Science','Class 10','IN-CBSE','CBSE',
 'Light — Reflection and Refraction','How light bounces off surfaces and bends through different media',
 ARRAY['Laws of reflection','Concave and convex mirrors','Snell''s law','Lens formula']),

('Science','Class 10','IN-CBSE','CBSE',
 'Electricity','Electric current, resistance, power and circuit calculations',
 ARRAY['Ohm''s law','Series circuits','Parallel circuits','Joule''s law']),

('Science','Class 10','IN-CBSE','CBSE',
 'Heredity and Evolution','How traits are passed from parents to offspring via DNA',
 ARRAY['Mendel''s laws','Genotype vs phenotype','Natural selection','Human evolution']),

-- ── CBSE CLASS 10 MATHEMATICS ─────────────────────────────────
('Mathematics','Class 10','IN-CBSE','CBSE',
 'Quadratic Equations','Solving second-degree polynomial equations and their applications',
 ARRAY['Factorisation method','Quadratic formula','Discriminant','Word problems']),

('Mathematics','Class 10','IN-CBSE','CBSE',
 'Triangles and Similarity','Proving triangles are similar and using proportionality theorems',
 ARRAY['AAA criterion','Pythagoras theorem','Basic proportionality theorem','Area ratio']),

('Mathematics','Class 10','IN-CBSE','CBSE',
 'Statistics and Probability','Measures of central tendency and basic probability',
 ARRAY['Mean median mode','Cumulative frequency','Probability rules','Events']),

-- ── NAPLAN (All States) ───────────────────────────────────────
('Mathematics','Year 7','AU-ALL','NAPLAN',
 'Number and Algebra','Working with integers, fractions and basic algebraic expressions',
 ARRAY['Negative numbers','Order of operations','Algebraic expressions','Simple equations']),

('English','Year 9','AU-ALL','NAPLAN',
 'Persuasive Writing','Writing a convincing argument with a clear position and supporting evidence',
 ARRAY['Claim and evidence','Rhetorical devices','Logical structure','Formal register']),

('Mathematics','Year 5','AU-ALL','NAPLAN',
 'Geometry and Measurement','Identifying shapes, angles and calculating perimeter and area',
 ARRAY['Angles on a line','Area of rectangles','Volume','Coordinate plane']),

-- ── EAMCET (Andhra Pradesh / Telangana) ───────────────────────
('Mathematics','Class 12','IN-AP','EAMCET',
 'Differential Equations','Forming and solving first-order differential equations',
 ARRAY['Variable separable','Homogeneous equations','Linear DE','Applications']),

('Physics','Class 12','IN-AP','EAMCET',
 'Semiconductor Devices','p-n junction diode, transistor and logic gates',
 ARRAY['Diode characteristics','Rectifiers','Transistor as switch','Logic gates']),

('Chemistry','Class 12','IN-AP','EAMCET',
 'Biomolecules','Structure and function of carbohydrates, proteins, lipids and nucleic acids',
 ARRAY['Glucose structure','Amino acids','Enzyme action','DNA and RNA']),

-- ── HSC BIOLOGY (NSW) ────────────────────────────────────────
('Biology','Year 12','AU-NSW','HSC',
 'Genetics — DNA to Proteins','How genetic information is stored in DNA and expressed as proteins',
 ARRAY['DNA replication','Transcription','Translation','Mutations']),

('Biology','Year 12','AU-NSW','HSC',
 'Infectious Disease','How pathogens cause disease and how the immune system responds',
 ARRAY['Bacteria vs viruses','Innate immunity','Adaptive immunity','Vaccines']),

('Biology','Year 11','AU-NSW','HSC',
 'Cell Biology','Structure and function of prokaryotic and eukaryotic cells',
 ARRAY['Organelles','Cell membrane','Mitosis','Osmosis and diffusion']);

-- Confirm count
SELECT COUNT(*) AS total_topics_seeded FROM topics;
