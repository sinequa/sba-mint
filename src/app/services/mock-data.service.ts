import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public readonly labels = signal(['Flag 1', 'Flag 2', 'Flag 3']);
  public readonly doctypes = signal(['Tickets', 'Web', 'Message', 'PDF', 'Word', 'Powerpoint', 'Video', 'Excel', 'Xml', 'Image']);
  public readonly people = signal(['Jean FERRE', 'Rachid HAMMOUDA', 'Adrian POTHUAUD', 'Tanguy CHEVILLARD', 'Manon CHAIX', 'Khoa DO TRINH', 'Kevin SUSAI', 'Tia NOBLE', 'Julien LOFFICIAL', 'Valentin FAZENDA', 'Arthur BRESNU', 'Sarah Kessler', 'Allen CHEN', 'Santosh Puttaswamy', 'Christie FRUSH', 'Ian QUINE', 'Max FREDERICKS', 'Oliver KRETOVS', 'Louis UNG', 'Christopher BABOCH', 'Marta WEGMANN', 'Virginie LE PEILLET', 'Charles RAVUSSIN', 'Ryan DONNELLY', 'Marius HULLIN', 'Audran DOUBLET', 'Mingee KIM', 'Laurent CHABENET', 'Valentine SOULIER', 'Alexis MEILLAND', 'Guillaume LEIBFRIED', 'Loïc JUILLET', 'David BOECHIE', 'Rémi MARTY', 'Jean REIMBOLD', 'Julie FARIA', 'Matthieu GABORIT', 'Christophe THIANT', 'Marjorie PERRISSIN-FABERT', 'Marc BIERMANN', 'Stephanie HAGUE', 'Kristina WEINBERG', 'Charlotte FOGLIA', 'Nedra ZEGHIDI', 'Clarine VONGPASEUT', 'Thomas DUQUENNOY', 'Martin HUVELLE', 'Romain BONNOT', 'Hugo VICARD', 'Charles WIBAUT', 'Dimitri JEAN', 'Youval VANLAER', 'Irene MARGARIT', 'Mathias VAST', 'Danial SHIRAZI', 'Jordane LAMARCHE', 'Alexia LIBERT LEMAY', 'Paul de LA CELLE', 'Sophie HOARAU', 'Miles YAEGER', 'Stéphane GOURICHON', 'Gregory WALKLET', 'Romain LEONARD', 'Mathieu METZGER', 'Fabrice BIRCKEL', 'Roxanne TRAN', 'Lucas OUBIB', 'Justin JOHN', 'Houman SALIMI']);
  public readonly locations = signal(['Paris', 'New York', 'Berlin', 'Pekin', 'Bruxelles', 'Chicago', 'Dunkerque', 'Marseille']);
  public readonly companies = signal(["Total", "Renault", "Peugeot", "BNP Paribas", "L'Oréal", "Airbus", "AXA", "Carrefour", "Orange", "Sanofi", "Société Générale", "Vivendi", "Michelin", "Danone", "Schneider Electric", "Saint-Gobain", "Veolia Environnement", "Capgemini", "Bouygues", "Essilor", "Dassault Systèmes", "EDF", "Thales", "Pernod Ricard", "LVMH", "Kering", "Accor", "Alstom", "Atos", "Crédit Agricole", "Engie", "Hermès", "Iliad", "JCDecaux", "LafargeHolcim", "Legrand", "Natixis", "Publicis Groupe", "Safran", "Sodexo", "STMicroelectronics", "Suez", "TechnipFMC", "Unibail-Rodamco-Westfield", "ValeoVinci", "Vivint Smart Home", "XPO Logistics", "Zodiac Aerospace", "CMA CGM"]);
  public readonly positions = signal(['Software Developer', 'System Analyst', 'Business Analyst', 'Database Administrator', 'Network Administrator', 'Data Scientist', 'Cloud Architect', 'IT Manager', 'IT Support Specialist', 'Security Analyst', 'Web Developer', 'Mobile Application Developer', 'UX/UI Designer', 'Quality Assurance Engineer', 'DevOps Engineer', 'IT Project Manager', 'IT Consultant', 'Front-end Developer', 'Back-end Developer', 'Full Stack Developer']);

  public getRandom(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
}
