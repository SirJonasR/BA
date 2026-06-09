INSERT INTO "User" (id, userName)
VALUES (-1, 'luke'),
       (-2, 'leia'),
       (-3, 'yoda');

-- Add theme_preference column if it doesn't exist (for local dev consistency)
ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'light';

INSERT INTO user_roles (user_id, role)
VALUES (-1, 'USER'),
       (-1, 'ADMIN'),
       (-2, 'USER'),
       (-3, 'USER'),
       (-3, 'TECSWAP');

INSERT INTO Category (id, name, description)
VALUES (-1, 'Languages & Frameworks', 'In Language & Frameworks werden Programmiersprachen und die zugehörigen Frameworks erfasst. Die Auswahl von Sprachen und Frameworks beeinflusst direkt die Leistung, Skalierbarkeit und Wartbarkeit der Anwendungen. Sprachen bilden die Grundlage für die Softwareentwicklung, während Frameworks spezifische Sets an Tools und Bibliotheken bieten, die gemeinsame Programmieraufgaben vereinfachen.'),
       (-2, 'Tools', 'Tools werden eingesetzt, um die Effizienz und Produktivität der Entwicklungsprozesse zu steigern, die Qualität des Codes zu verbessern und die Zusammenarbeit im Team zu erleichtern. Dazu gehören Entwicklungsumgebungen, Versionskontrollsysteme, Testwerkzeuge, Build- und Deployment-Tools sowie Monitoring- und Debugging-Tools.'),
       (-3, 'Platforms', 'Plattformen beziehen sich auf die Umgebungen, in denen Anwendungen ausgeführt und verwaltet werden. Plattformen bieten die notwendige Infrastruktur und die Dienste, die für das Hosting, die Skalierung und die Sicherheit von Anwendungen erforderlich sind. Die richtige Plattformwahl unterstützt die Effizienz, Verfügbarkeit und Flexibilität der Systeme. Dazu zählen Betriebssysteme, Cloud-Dienste, Container-Orchestrierungsplattformen, Datenbanken und Webserver.'),
       (-4, 'Techniques & Methodologies', 'Techniques & Methodologies deckt die Methoden und Praktiken ab, die in den Lebenszyklen der Softwareentwicklung und des Projektmanagements angewendet werden. Sie sind entscheidend für die Organisation und Optimierung von Entwicklungsprozessen. Sie beeinflussen die Teamdynamik, die Qualitätssicherung, die Zeit bis zur Markteinführung und die Anpassungsfähigkeit an Veränderungen. Dazu gehören agile Methoden, DevOps-Praktiken, Teststrategien und Design Patterns.');

INSERT INTO Lifecycle (id, name, sort, description)
VALUES (-4, 'Maintain', 1, 'Diese Technologien werden für den breiten Einsatz empfohlen und gelten als etablierte Lösungen, nachdem sie sich in verschiedenen Projekten und Teams als zuverlässig und nützlich erwiesen haben.'),
       (-3, 'Adopt', 2, 'Dieser Lebenszyklus umfasst Technologien, die als branchenführend angesehen werden und deren Übernahme empfohlen wird. An geeigneter Stelle verwenden wir die Technologien bei unseren Projekten.'),
       (-2, 'Assess', 3, 'Diese Technologien befinden sich in der Evaluierungsphase, wobei ihr Einsatz in spezifischen, dafür geeigneten Projekten in Betracht gezogen wird. Ziel ist es, ihre Eignung, Leistungsfähigkeit und den Mehrwert für das Projekt sorgfältig zu prüfen, bevor eine breitere Implementierung empfohlen wird.'),
       (-1, 'Monitor', 4, 'Wir verwenden diese Technologien nur noch zur Instandhaltung in Altprojekten, weil bessere Alternativen existieren.'),
       (-5, 'Undefined', 5, 'Diese Technologien wurden noch keinem Lebenszyklus zugewiesen.'),
       (-6, 'Deprecated', 6, 'Diese Technologien werden als veraltet angesehen und ihr Einsatz wird nicht empfohlen.');

INSERT INTO Technology (id, name, description, short_description, category_id, lifecycle_id, jump_date, status)
VALUES (-1, 'Quarkus', 'Lorem ipsum dolor amet.','Eine Kurzbeschreibung zu Quarkus', -1, -1,'2023-08-18',1),
       (-2, 'IntelliJ', 'Lorem ipsum dolor amet.','Eine Kurzbeschreibung zu InteliJ', -2, -2,'2023-08-18',1),
       (-3, 'AWS', 'Lorem ipsum dolor amet.','Eine Kurzbeschreibung zu AWS', -3, -3, '2022-08-18',1),
       (-4, 'TypeScript', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu TypeScript', -1, -3,'2023-08-18', 1),
       (-5, 'Java', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Java', -1, -3,'2022-08-18',1),
       (-6, 'VSCode', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu VSCode', -2, -3,'2020-08-18', 1),
       (-7, 'Agile', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Agile', -4, -3,'2023-08-18',1),
       (-8, 'Scrum', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Scrum', -4, -4,'2023-08-18', 1);

INSERT INTO TAG(name)
VALUES ('Tag1'),
        ('Tag2');

INSERT INTO TECHNOLOGY_TAG(technologies_id, tags_name)
VALUES(-2, 'Tag1'),
      (-2, 'Tag2'),
      (-3, 'Tag1'),
      (-3, 'Tag2');

INSERT INTO HISTORY (id, technology_id, name, description, short_description, changeDate, category_id, lifecycle_id,
                     user_id)
VALUES (-1, -1, 'Quarkus', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Quarkus', '2022-10-06T07:20:35.765', -1,
        -1, -1),
       (-2, -2, 'IntelliJ', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung IntelliJ', '2022-10-06T07:20:35.765', -2,
        -2, -1),
       (-3, -3, 'AWS', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu AWS', '2022-10-06T07:20:35.765', -3, -3,
        -2),
       (-4, -4, 'TypeScript', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu TypeScript',
        '2022-10-06T07:20:35.765', -1, -3, -1),
       (-5, -5, 'Java', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Java', '2022-10-06T07:20:35.765', -1, -3,
        -1),
       (-6, -6, 'VSCode', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu VSCode', '2022-10-06T07:20:35.765', -2,
        -3, -1),
       (-7, -7, 'Agile', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Agile', '2022-10-06T07:20:35.765', -4, -3,
        -1),
       (-8, -8, 'Scrum', 'Lorem ipsum dolor amet.', 'Eine Kurzbeschreibung zu Scrum', '2022-10-06T07:20:35.765', -4, -4,
        -1);

INSERT INTO CONTACTFORM (id, consentDate, user_id)
VALUES (-1, '2022-10-06T07:20:35.765', -1);

INSERT INTO Customer (id, name)
VALUES (-1, 'BMW Group'),
       (-2, 'Siemens AG'),
       (-3, 'Deutsche Bank'),
       (-4, 'SAP SE'),
       (-5, 'Volkswagen AG'),
       (-6, 'Bosch'),
       (-7, 'Allianz'),
       (-8, 'BASF'),
       (-9, 'Startup TechCorp'),
       (-10, 'Internal Eviden');

INSERT INTO Industry (id, name)
VALUES (-1, 'PSD - Public Sector & Defense'),
       (-2, 'FS&I - Financial Services & Insurance'),
       (-3, 'MAN - Manufacturing'),
       (-4, 'HLS - Health & Life Sciences'),
       (-5, 'TMT - Telecom, Media & Technology'),
       (-6, 'R&S - Resources & Services');
       
INSERT INTO Project (id, name, description, sales_service_link, info, industry_specific_information, start_date, end_date)
VALUES (-1, 'Digital Banking Platform',
        'Modernisierung der Online-Banking-Plattform mit neuen Sicherheitsfeatures und verbesserter User Experience. Migration von Legacy-Systemen auf moderne Cloud-Infrastruktur.',
        'https://nextgen.myatos.net/',
        'Kritisches Projekt mit hoher Sichtbarkeit. Regulatorische Compliance erforderlich.',
        'Spezifische Anforderungen für die Bankenbranche. Besondere Aufmerksamkeit auf Datensicherheit und Privatsphäre.',
        '2023-01-15', '2024-06-30'),
       
       (-2, 'Smart Factory IoT Solution',
        'Implementierung einer IoT-basierten Lösung zur Überwachung und Optimierung von Produktionsanlagen. Echtzeit-Datenanalyse und predictive maintenance.',
        'https://nextgen.myatos.net/',
        'Pilot-Projekt für Industry 4.0 Initiative. Potenzial für Rollout auf weitere Werke.',
        'Spezifische Anforderungen für die Industrie 4.0. Besondere Aufmerksamkeit auf Echtzeit-Datenanalyse und Maschinenverbindung.',
        '2023-03-22', '2025-09-15'),
        
       (-3, 'HR Management System',
        'Entwicklung eines internen HR-Tools für Mitarbeiterverwaltung, Urlaubsplanung und Performance-Tracking. Integration mit bestehenden Systemen.',
        'https://nextgen.myatos.net/',
        'Internes Projekt zur Effizienzsteigerung. Agile Entwicklung mit 2-Wochen-Sprints.',
        'Spezifische Anforderungen für interne Projekte. Besondere Aufmerksamkeit auf Benutzerfreundlichkeit und Integration mit bestehenden Tools.',
        '2022-11-08', '2026-03-20'),
        
       (-4, 'E-Commerce Mobile App',
        'Native mobile App für iOS und Android mit personalisierten Produktempfehlungen und nahtloser Checkout-Experience.',
        'https://nextgen.myatos.net/',
        'B2C-Fokus, hohe Performance-Anforderungen. A/B-Testing geplant.',
        'Spezifische Anforderungen für den E-Commerce-Bereich. Besondere Aufmerksamkeit auf Benutzererfahrung und Performance.',
        '2023-06-10', '2024-12-22'),
        
       (-5, 'Insurance Claims Processing',
        'Automatisierung der Schadenabwicklung durch KI-gestützte Dokumentenanalyse und Workflow-Optimierung.',
        'https://nextgen.myatos.net/',
        'Regulatorische Anforderungen zu beachten. Machine Learning Integration.',
        'Spezifische Anforderungen für die Versicherungsbranche. Besondere Aufmerksamkeit auf KI-gestützte Dokumentenanalyse und Workflow-Optimierung.',
        '2023-02-28', '2024-08-14'),
        
       (-6, 'Automotive Dashboard System',
        'Entwicklung eines digitalen Cockpit-Systems für Elektrofahrzeuge mit Echtzeit-Navigationsdaten und Fahrzeugdiagnose.',
        'https://nextgen.myatos.net/',
        'Embedded Systems Projekt. Hohe Sicherheits- und Performance-Anforderungen.',
        'Spezifische Anforderungen für Automotive-Projekte. Besondere Aufmerksamkeit auf Sicherheit und Echtzeit-Performance.',
        '2022-09-12', '2024-04-18'),
        
       (-7, 'Enterprise Data Analytics',
        'Big Data Platform für unternehmensweite Datenanalyse und Business Intelligence. Self-Service Analytics für Fachbereiche.',
        'https://nextgen.myatos.net/',
        'Datengovernance kritisch. GDPR-Compliance erforderlich.',
        'Spezifische Anforderungen für Enterprise Data Analytics. Besondere Aufmerksamkeit auf Datengovernance und GDPR-Compliance.',
        '2023-04-05', '2025-01-31'),
        
       (-8, 'Chemical Process Optimization',
        'Digitalisierung von Chemieanlagen mit fortschrittlicher Prozesssteuerung und Optimierungsalgorithmen.',
        'https://nextgen.myatos.net/',
        'Forschungsprojekt mit universitärer Kooperation. Patentanmeldungen geplant.',
        'Spezifische Anforderungen für Chemie-Projekte. Besondere Aufmerksamkeit auf Sicherheit und Prozessoptimierung.',
        '2022-12-18', '2025-06-30'),
        
       (-9, 'Fintech Startup Platform',
        'MVP-Entwicklung für Kryptowährungs-Trading-Plattform mit Social Trading Features und Portfolio-Management.',
        'https://nextgen.myatos.net/',
        'Startup-Umfeld, schnelle Iterationen. Skalierbarkeit von Anfang an berücksichtigen.',
        'Spezifische Anforderungen für Fintech-Startups. Besondere Aufmerksamkeit auf Skalierbarkeit und Sicherheit.',
        '2023-07-20', '2024-02-28'),
        
       (-10, 'Internal Tool Migration',
        'Migration veralteter interner Tools auf moderne Technologie-Stack. Code-Refactoring und Architektur-Modernisierung.',
        'https://nextgen.myatos.net/',
        'Technische Schulden abbauen. Keine neuen Features, nur Modernisierung.',
        'Spezifische Anforderungen für interne Modernisierungsprojekte. Besondere Aufmerksamkeit auf Code-Qualität und Wartbarkeit.',
        '2022-08-30', '2024-05-15');

INSERT INTO project_customer (project_id, customer_id)
VALUES (-1, -3),  -- Digital Banking Platform -> Deutsche Bank
       (-2, -6),  -- Smart Factory IoT -> Bosch  
       (-2, -1),  -- Smart Factory IoT -> BMW Group (shared project)
       (-3, -10), -- HR Management -> Internal Eviden
       (-4, -8),  -- E-Commerce App -> BASF
       (-5, -7),  -- Insurance Claims -> Allianz
       (-6, -5),  -- Automotive Dashboard -> Volkswagen AG
       (-6, -1),  -- Automotive Dashboard -> BMW Group
       (-7, -4),  -- Data Analytics -> SAP SE
       (-7, -2),  -- Data Analytics -> Siemens AG
       (-8, -8),  -- Chemical Process -> BASF
       (-9, -9),  -- Fintech Platform -> Startup TechCorp
       (-10, -10); -- Tool Migration -> Internal Eviden

-- Insert Contact data (converted from old contact_person field)
INSERT INTO contact (id, email, role, project_id)
VALUES (-1, 'max.mustermann@eviden.com', 'Project Lead', -1),
       (-2, 'anna.schmidt@eviden.com', 'Technical Lead', -2),
       (-3, 'peter.wagner@eviden.com', 'Project Manager', -3),
       (-4, 'lisa.mueller@eviden.com', 'Product Owner', -4),
       (-5, 'thomas.bauer@eviden.com', 'Architect', -5),
       (-6, 'sarah.klein@eviden.com', 'Lead Developer', -6),
       (-7, 'michael.weber@eviden.com', 'Data Engineer', -7),
       (-8, 'andrea.fischer@eviden.com', 'Research Lead', -8),
       (-9, 'david.tech@eviden.com', 'Startup Lead', -9),
       (-10, 'julia.entwickler@eviden.com', 'Technical Lead', -10);

-- Link Projects to Technologies (diverse tech stacks)
INSERT INTO project_technology (project_id, technology_id)
VALUES -- Digital Banking Platform (modern web stack)
       (-1, -5),  -- Java
       (-1, -1),  -- Quarkus
       (-1, -3),  -- AWS
       (-1, -4),  -- TypeScript
       
       -- Smart Factory IoT (IoT/embedded focus)
       (-2, -5),  -- Java
       (-2, -3),  -- AWS
       (-2, -2),  -- IntelliJ
       
       -- HR Management System (internal tools)
       (-3, -4),  -- TypeScript
       (-3, -6),  -- VSCode
       (-3, -7),  -- Agile
       (-3, -8),  -- Scrum
       
       -- E-Commerce Mobile App (mobile focus)
       (-4, -4),  -- TypeScript
       (-4, -3),  -- AWS
       (-4, -7),  -- Agile
       
       -- Insurance Claims (enterprise)
       (-5, -5),  -- Java
       (-5, -1),  -- Quarkus
       (-5, -2),  -- IntelliJ
       (-5, -8),  -- Scrum
       
       -- Automotive Dashboard (embedded/automotive)
       (-6, -5),  -- Java
       (-6, -2),  -- IntelliJ
       (-6, -8),  -- Scrum
       
       -- Data Analytics (big data)
       (-7, -5),  -- Java
       (-7, -3),  -- AWS
       (-7, -7),  -- Agile
       
       -- Chemical Process (research)
       (-8, -5),  -- Java
       (-8, -2),  -- IntelliJ
       (-8, -7),  -- Agile
       
       -- Fintech Startup (modern stack)
       (-9, -4),  -- TypeScript
       (-9, -6),  -- VSCode
       (-9, -3),  -- AWS
       (-9, -7),  -- Agile
       
       -- Tool Migration (legacy modernization)
       (-10, -5), -- Java
       (-10, -1), -- Quarkus
       (-10, -6), -- VSCode
       (-10, -8); -- Scrum
	   
INSERT INTO feature_flags (enabled, id, description, name)
VALUES (false, 1, 'Steuert, ob das Frontend beim Aufruf einer Technology-Detail Seite versucht, die Deep Experts abzurufen.', 'SHOW_DEEP_EXPERTS_IN_TECHNOLOGY_DETAIL'),
       (true, 2, 'Enables theme switching functionality. When disabled, forces light theme and hides theme toggle button.', 'ENABLE_THEME_SWITCHING'),
       (false, 3, '', 'SHOW_LEGACY_RADAR_LEGEND'),
        (false, 4, 'Zeigt das Einstellungen-Symbol in der Navigationsleiste an.', 'SHOW_SETTINGS_ICON'),
        (false, 5, 'Aktiviert den Upload für SBOM-Dateien im Projektformular.', 'ENABLE_SBOM_UPLOAD');
