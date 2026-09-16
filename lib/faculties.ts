
interface IFaculty {
    faculty: string;
    departments: IDepartments[]
}

interface IDepartments {
    name: string;
    code: string;
}

const faculties: IFaculty[] = [
    {
        "faculty": "Faculty of Administration",
        "departments": [
            { "name": "Department of Public Administration", "code": "PAD" },
            { "name": "Department of Management and Accounting", "code": "ACC" },
            { "name": "Department of International Relations", "code": "IRS" },
            { "name": "Department of Local Government Studies", "code": "LGS" }
        ]
    },
    {
        "faculty": "Faculty of Agriculture",
        "departments": [
            { "name": "Department of Agricultural Economics", "code": "AEC" },
            { "name": "Department of Agricultural Extension and Rural Development", "code": "AXD" },
            { "name": "Department of Animal Sciences", "code": "ANS" },
            { "name": "Department of Crop Production and Protection", "code": "CPP" },
            { "name": "Department of Soil Science and Land Resources Management", "code": "SLM" },
            { "name": "Department of Family, Nutrition and Consumer Sciences", "code": "FCS" }
        ]
    },
    {
        "faculty": "Faculty of Arts",
        "departments": [
            { "name": "Department of English", "code": "EGL" },
            { "name": "Department of Linguistics and African Languages", "code": "LAL" },
            { "name": "Department of History", "code": "HIS" },
            { "name": "Department of Religious Studies", "code": "REL" },
            { "name": "Department of Philosophy", "code": "PHL" },
            { "name": "Department of Dramatic Arts", "code": "DRA" },
            { "name": "Department of Music", "code": "MUS" },
            { "name": "Department of Foreign Languages", "code": "LIT" }
        ]
    },
    {
        "faculty": "Faculty of Computing Science and Engineering",
        "departments": [
            { "name": "Department of Computer Science & Cybersecurity", "code": "CSC" },
            { "name": "Department of Computer Engineering", "code": "CPE" },
            { "name": "Department of Software Engineering", "code": "SEN" },
            { "name": "Department of Information Systems", "code": "IFS" },
            { "name": "Department of Intelligent Systems Engineering", "code": "ISE" }
        ]
    },
    {
        "faculty": "Faculty of Education",
        "departments": [
            { "name": "Department of Adult Education and Lifelong Learning", "code": "ADE" },
            { "name": "Department of Educational Management", "code": "EDM" },
            { "name": "Department of Educational Technology and Library Studies", "code": "EDT" },
            { "name": "Department of Arts and Social Science Education", "code": "ASE" },
            { "name": "Department of Science and Technology Education", "code": "STE" },
            { "name": "Department of Physical and Health Education", "code": "PHE" },
            { "name": "Department of Educational Foundations and Counselling", "code": "EFC" }
        ]
    },
    {
        "faculty": "Faculty of Environmental Design and Management",
        "departments": [
            { "name": "Department of Architecture", "code": "ARC" },
            { "name": "Department of Building", "code": "BLD" },
            { "name": "Department of Estate Management", "code": "ESM" },
            { "name": "Department of Quantity Surveying", "code": "QTS" },
            { "name": "Department of Urban and Regional Planning", "code": "URP" },
            { "name": "Department of Fine and Applied Arts", "code": "FAA" }
        ]
    },
    {
        "faculty": "Faculty of Law",
        "departments": [
            { "name": "Department of Business Law", "code": "BUL" },
            { "name": "Department of International Law", "code": "PUL" },
            { "name": "Department of Jurisprudence and Private Law", "code": "JIL" },
            { "name": "Department of Public Law", "code": "PUL" }
        ]
    },
    {
        "faculty": "Faculty of Pharmacy",
        "departments": [
            { "name": "Department of Clinical Pharmacy and Pharmacy Administration", "code": "PHA" },
            { "name": "Department of Pharmaceutical Chemistry", "code": "PCH" },
            { "name": "Department of Pharmaceutics", "code": "PCT" },
            { "name": "Department of Pharmacognosy", "code": "PCG" },
            { "name": "Department of Pharmacology", "code": "PCL" }
        ]
    },
    {
        "faculty": "Faculty of Science",
        "departments": [
            { "name": "Department of Biochemistry and Molecular Biology", "code": "BCH" },
            { "name": "Department of Botany", "code": "BOT" },
            { "name": "Department of Chemistry", "code": "CHM" },
            { "name": "Department of Geology", "code": "GLY" },
            { "name": "Department of Mathematics", "code": "MTH" },
            { "name": "Department of Microbiology", "code": "MCB" },
            { "name": "Department of Physics and Engineering Physics", "code": "PHY" },
            { "name": "Department of Zoology", "code": "ZOO" }
        ]
    },
    {
        "faculty": "Faculty of Social Sciences",
        "departments": [
            { "name": "Department of Economics", "code": "ECN" },
            { "name": "Department of Geography", "code": "GEO" },
            { "name": "Department of Political Science", "code": "POL" },
            { "name": "Department of Psychology", "code": "PSY" },
            { "name": "Department of Sociology and Anthropology", "code": "SOC" },
            { "name": "Department of Demography and Social Statistics", "code": "DSS" }
        ]
    },
    {
        "faculty": "Faculty of Technology",
        "departments": [
            { "name": "Department of Civil Engineering", "code": "CVE" },
            { "name": "Department of Electronic and Electrical Engineering", "code": "EEE" },
            { "name": "Department of Mechanical Engineering", "code": "MEE" },
            { "name": "Department of Chemical Engineering", "code": "CHE" },
            { "name": "Department of Materials Science and Engineering", "code": "MSE" },
            { "name": "Department of Agricultural and Environmental Engineering", "code": "AGE" },
            { "name": "Department of Food Science and Technology", "code": "FST" },
            { "name": "Department of Aerospace Engineering", "code": "ASE" }
        ]
    },
    {
        "faculty": "Faculty of Basic Medical Sciences",
        "departments": [
            { "name": "Department of Anatomy and Cell Biology", "code": "ANA" },
            { "name": "Department of Chemical Pathology", "code": "CHP" },
            { "name": "Department of Haematology and Immunology", "code": "HAR" },
            { "name": "Department of Medical Biochemistry", "code": "MBC" },
            { "name": "Department of Medical Microbiology and Parasitology", "code": "MMP" },
            { "name": "Department of Pathology", "code": "PTH" },
            { "name": "Department of Pharmacology and Therapeutics", "code": "PCT" },
            { "name": "Department of Physiological Sciences", "code": "PSG" }
        ]
    },
    {
        "faculty": "Faculty of Clinical Sciences",
        "departments": [
            { "name": "Department of Anaesthesia and Intensive Care", "code": "ANC" },
            { "name": "Department of Community Health", "code": "CHE" },
            { "name": "Department of Dermatology and Venereology", "code": "DER" },
            { "name": "Department of Medicine", "code": "MED" },
            { "name": "Department of Mental Health", "code": "MTH" },
            { "name": "Department of Nursing Science", "code": "NSG" },
            { "name": "Department of Obstetrics, Gynaecology and Perinatology", "code": "OBG" },
            { "name": "Department of Ophthalmology", "code": "OPT" },
            { "name": "Department of Orthopaedics and Traumatology", "code": "ORT" },
            { "name": "Department of Paediatrics and Child Health", "code": "PED" },
            { "name": "Department of Radiology", "code": "RAD" },
            { "name": "Department of Surgery", "code": "SUR" }
        ]
    },
    {
        "faculty": "Faculty of Dentistry",
        "departments": [
            { "name": "Department of Child Dental Health", "code": "CDH" },
            { "name": "Department of Oral/Maxillofacial Surgery and Oral Pathology", "code": "OSP" },
            { "name": "Department of Preventive and Community Dentistry", "code": "PCD" },
            { "name": "Department of Restorative Dentistry", "code": "RES" }
        ]
    }
]



export function getFaculties(): string[] {
    return faculties.map((f) => f.faculty);
}

export function getDepartments(faculty: string): string[] {
    const facultyObj = faculties.find((f) => f.faculty === faculty);
    if (!facultyObj) return []
    return facultyObj?.departments.map((d) => d.name);
}