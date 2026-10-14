/* UniSchedule — script.js
   Sections: 1 Source data · 2 Constants · 3 Pure data helpers · 4 State · 5 UI · 6 Export · 7 Wiring

   DATA PROVENANCE
   Records were extracted from "IT Schedule Fall Semester 2026-2027.pdf" using the PDF's real
   layout (cell geometry + cell fill colours), not flat text:
   - column -> session (Session1..Session9 = 08:00..17:00, one hour each; a cell spanning two columns is a 2-hour session)
   - row    -> weekday (page 1 Sat/Sun, page 2 Mon/Tue, page 3 Wed/Thu)
   - fill   -> academic year (orange 1, blue 2, green 3, gray 4), cross-checked with printed "IT-n" labels
   - yellow cells carry no year colour; the year comes from the printed IT label or, if absent, from the same
     course appearing in coloured cells of exactly one year (the row's note says so).
   Row layout:
   [year, dayIndex (0 = Saturday), startSession, endSession, courseName, kind 'L'|'P', group 'A'|'B'|null,
    section 'S01'..|null, mode 'FTF'|'VCR'|null, instructor, room, note, needsVerification 0|1]
   null = not printed in the source. Nothing is guessed. */

/* ---------- 1. Source data (verified records) ---------- */
const SOURCE_ROWS = [
  [1, 0, 3, 3, "Introduction to Computers", "P", null, "S02", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 0, 4, 4, "Electronics", "P", null, "S02", null, "Eng. M-Kamal", "R2", null, 0],
  [1, 0, 4, 4, "Mathematics (1)", "P", null, "S01", null, "Eng. M-Attia", "R6", null, 0],
  [1, 0, 5, 5, "Electronics", "P", null, "S01", null, "Eng. M-Kamal", "R2", null, 0],
  [1, 0, 5, 5, "Mathematics (1)", "P", null, "S02", null, "Eng. M-Attia", "R6", null, 0],
  [1, 0, 7, 7, "Mathematics (0)", "L", "A", null, "FTF", "Dr. Amany", "R1", null, 0],
  [1, 0, 7, 7, "Mathematics (0)", "L", "B", null, "VCR", "Dr. Amany", "R1", null, 0],
  [1, 0, 8, 8, "Discrete Mathematics", "L", "A", null, "FTF", "Dr. Adel Fathy", "R1", null, 0],
  [1, 0, 8, 8, "Discrete Mathematics", "L", "B", null, "VCR", "Dr. Adel Fathy", "R1", null, 0],
  [1, 0, 9, 9, "Mathematics (1)", "L", "A", null, "FTF", "Dr. Amany", "R1", null, 0],
  [1, 0, 9, 9, "Mathematics (1)", "L", "B", null, "VCR", "Dr. Amany", "R1", null, 0],
  [1, 1, 1, 1, "Introduction to Computers", "L", "A", null, "FTF", "Dr. Dina Tarek", "R1", null, 0],
  [1, 1, 1, 1, "Introduction to Computers", "L", "B", null, "VCR", "Dr. Dina Tarek", "R1", null, 0],
  [1, 1, 2, 2, "Electronics", "L", "A", null, "FTF", "Dr. Hadeer Elhawary (Assiut)", "R1", null, 0],
  [1, 1, 2, 2, "Electronics", "L", "B", null, "VCR", "Dr. Hadeer Elhawary (Assiut)", "R1", null, 0],
  [1, 1, 3, 3, "Mathematics (0)", "P", null, "S01", null, "Eng. Sama", "R1", null, 0],
  [1, 1, 4, 4, "Mathematics (1)", "P", null, "S03", null, "Eng. M-Attia", "R2", null, 0],
  [1, 2, 2, 2, "Discrete Mathematics", "P", null, "S01", null, "Eng. M-Al-Banna", "R2", null, 0],
  [1, 2, 2, 2, "Mathematics (1)", "P", null, "S06", null, "Eng. M-Attia", "R4", null, 0],
  [1, 2, 3, 3, "Discrete Mathematics", "P", null, "S06", null, "Eng. M-Al-Banna", "R2", null, 0],
  [1, 2, 3, 3, "Introduction to Computers", "P", null, "S01", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 2, 4, 4, "Introduction to Computers", "P", null, "S06", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 2, 5, 5, "Discrete Mathematics", "P", null, "S03", null, "Eng. M-Al-Banna", "R2", null, 0],
  [1, 2, 6, 6, "Discrete Mathematics", "P", null, "S02", null, "Eng. M-Al-Banna", "R2", null, 0],
  [1, 2, 6, 6, "Introduction to Computers", "P", null, "S03", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 2, 6, 6, "Mathematics (1)", "P", null, "S04", null, "Eng. M-Attia", "R4", null, 0],
  [1, 2, 7, 7, "Discrete Mathematics", "P", null, "S04", null, "Eng. M-Al-Banna", "R2", null, 0],
  [1, 2, 7, 7, "Mathematics (0)", "P", null, "S02", null, "Eng. M-Khalifa", "R4", null, 0],
  [1, 2, 7, 7, "Mathematics (0)", "P", null, "S03", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 2, 8, 8, "Introduction to Computers", "P", null, "S04", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 2, 9, 9, "Electronics", "P", null, "S03", null, "Eng. M-Khalifa", "R2", null, 0],
  [1, 3, 5, 5, "Discrete Mathematics", "P", null, "S05", null, "Eng. Marihan", "R2", null, 0],
  [1, 3, 7, 7, "Introduction to Computers", "P", null, "S05", null, "Eng. Sama", "Lab 2", null, 0],
  [1, 3, 7, 7, "Mathematics (0)", "L", "A", null, "VCR", "Dr. Amany", "R1", null, 0],
  [1, 3, 7, 7, "Mathematics (0)", "L", "B", null, "FTF", "Dr. Amany", "R1", null, 0],
  [1, 3, 8, 8, "Discrete Mathematics", "L", "A", null, "VCR", "Dr. Adel Fathy", "R1", null, 0],
  [1, 3, 8, 8, "Discrete Mathematics", "L", "B", null, "FTF", "Dr. Adel Fathy", "R1", null, 0],
  [1, 3, 9, 9, "Mathematics (1)", "L", "A", null, "VCR", "Dr. Amany", "R1", null, 0],
  [1, 3, 9, 9, "Mathematics (1)", "L", "B", null, "FTF", "Dr. Amany", "R1", null, 0],
  [1, 4, 1, 1, "Introduction to Computers", "L", "A", null, "VCR", "Dr. Dina Tarek", "R1", null, 0],
  [1, 4, 1, 1, "Introduction to Computers", "L", "B", null, "FTF", "Dr. Dina Tarek", "R1", null, 0],
  [1, 4, 2, 2, "Electronics", "L", "A", null, "VCR", "Dr. Hadeer Elhawary (Assiut)", "R1", null, 0],
  [1, 4, 2, 2, "Electronics", "L", "B", null, "FTF", "Dr. Hadeer Elhawary (Assiut)", "R1", null, 0],
  [1, 4, 3, 3, "Electronics", "P", null, "S06", null, "Eng. M-Kamal", "R2", null, 0],
  [1, 4, 4, 4, "Electronics", "P", null, "S04", null, "Eng. M-Kamal", "R2", null, 0],
  [1, 5, 8, 8, "Electronics", "P", null, "S05", null, "Eng. M-Kamal", "R4", null, 0],
  [1, 5, 9, 9, "Mathematics (1)", "P", null, "S05", null, "Eng. M-Attia", "R4", null, 0],
  [2, 0, 2, 2, "Computer Networks Technology", "P", null, "S02", null, "Eng. Amany", "Lab 2", null, 0],
  [2, 0, 3, 3, "Probability and Statistics-2", "P", null, "S02", null, "Eng. Marihan", "R2", null, 0],
  [2, 0, 6, 6, "Computer Networks Technology", "P", null, "S01", null, "Eng. Amany", "Lab 1", null, 0],
  [2, 0, 7, 7, "Introduction to Software Engineering", "P", null, "S01", null, "Eng. M-Attia", "R2", null, 0],
  [2, 0, 7, 7, "Probability and Statistics-2", "P", null, "S04", null, "Eng. Marihan", "R4", null, 0],
  [2, 0, 8, 8, "Mathematics-3", "P", null, "S04", null, "Eng. M-Attia", "R2", null, 0],
  [2, 0, 8, 8, "Probability and Statistics-2", "P", null, "S01", null, "Eng. Marihan", "R4", null, 0],
  [2, 0, 9, 9, "Introduction to Software Engineering", "P", null, "S04", null, "Eng. M-Attia", "R2", null, 0],
  [2, 1, 3, 3, "Computer Networks Technology", "L", null, null, "VCR", "Dr. Dina Tarek", "R1", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [2, 1, 3, 3, "Introduction to Database systems", "L", "A", null, "FTF", "Dr. Ahmed hamza", "R4", null, 0],
  [2, 1, 3, 3, "Introduction to Database systems", "L", "B", null, "VCR", "Dr. Ahmed hamza", "R4", null, 0],
  [2, 1, 4, 4, "Introduction to Database systems", "L", null, null, "VCR", "Dr. Reham Adel", "R4", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [2, 1, 4, 4, "Mathematics-3", "L", "A", null, "FTF", "Dr. Amany", "R1", null, 0],
  [2, 1, 4, 4, "Mathematics-3", "L", "B", null, "VCR", "Dr. Amany", "R1", null, 0],
  [2, 1, 5, 5, "Computer Networks Technology", "L", "A", null, "FTF", "Dr. Safy Ibrahim", "R1", null, 0],
  [2, 1, 5, 5, "Computer Networks Technology", "L", "B", null, "VCR", "Dr. Safy Ibrahim", "R1", null, 0],
  [2, 1, 7, 7, "Introduction to Database systems", "P", null, "S01", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 1, 7, 7, "Introduction to Software Engineering", "P", null, "S02", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [2, 1, 8, 8, "Object Oriented Programming", "P", null, "S01", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 1, 8, 8, "Object Oriented Programming", "P", null, "S02", null, "Eng. Sama", "Lab 2", null, 0],
  [2, 2, 3, 3, "Object Oriented Programming", "P", null, "S03", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 2, 4, 4, "Introduction to Database systems", "P", null, "S03", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 2, 4, 4, "Mathematics-3", "P", null, "S02", null, "Eng. M-Attia", "R4", null, 0],
  [2, 2, 5, 5, "Introduction to Database systems", "P", null, "S02", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 2, 5, 5, "Mathematics-3", "P", null, "S03", null, "Eng. M-Attia", "Lab 2", null, 0],
  [2, 2, 6, 6, "Mathematics-3", "P", null, "S01", null, "Eng. M-Khalifa", "R1", null, 0],
  [2, 2, 7, 7, "Object Oriented Programming", "L", "A", null, "FTF", "Dr. Yasser", "R1", null, 0],
  [2, 2, 7, 7, "Object Oriented Programming", "L", "B", null, "VCR", "Dr. Yasser", "R1", null, 0],
  [2, 2, 8, 8, "Probability and Statistics-2", "L", "A", null, "FTF", "Dr. Abdelbaset", "R1", null, 0],
  [2, 2, 8, 8, "Probability and Statistics-2", "L", "B", null, "VCR", "Dr. Abdelbaset", "R1", null, 0],
  [2, 2, 9, 9, "Introduction to Software Engineering", "L", "A", null, "FTF", "Dr. Asmaa Jad", "R1", null, 0],
  [2, 2, 9, 9, "Introduction to Software Engineering", "L", "B", null, "VCR", "Dr. Asmaa Jad", "R1", null, 0],
  [2, 3, 2, 2, "Computer Networks Technology", "P", null, "S03", null, "Eng. Amany", "Lab 1", null, 0],
  [2, 3, 3, 3, "Probability and Statistics-2", "P", null, "S03", null, "Eng. Marihan", "Lab 1", null, 0],
  [2, 3, 4, 4, "Introduction to Software Engineering", "P", null, "S03", null, "Eng. M-Al-Banna", "R2", null, 0],
  [2, 3, 4, 4, "Mathematics-3", "P", null, "S05", null, "Eng. Sama", "R4", null, 0],
  [2, 3, 6, 6, "Computer Networks Technology", "P", null, "S05", null, "Eng. Amany", "Lab 1", null, 0],
  [2, 3, 7, 7, "Probability and Statistics-2", "P", null, "S05", null, "Eng. Marihan", "R2", null, 0],
  [2, 4, 2, 2, "Object Oriented Programming", "P", null, "S05", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 4, 3, 3, "Computer Networks Technology", "L", null, null, "VCR", "Dr. Dina Tarek", "R1", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [2, 4, 3, 3, "Introduction to Database systems", "L", "A", null, "VCR", "Dr. Ahmed hamza", "R4", null, 0],
  [2, 4, 3, 3, "Introduction to Database systems", "L", "B", null, "FTF", "Dr. Ahmed hamza", "R4", null, 0],
  [2, 4, 4, 4, "Introduction to Database systems", "L", null, null, "VCR", "Dr. Reham Adel", "R4", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [2, 4, 4, 4, "Mathematics-3", "L", "A", null, "VCR", "Dr. Amany", "R1", null, 0],
  [2, 4, 4, 4, "Mathematics-3", "L", "B", null, "FTF", "Dr. Amany", "R1", null, 0],
  [2, 4, 5, 5, "Computer Networks Technology", "L", "A", null, "VCR", "Dr. Safy Ibrahim", "R1", null, 0],
  [2, 4, 5, 5, "Computer Networks Technology", "L", "B", null, "FTF", "Dr. Safy Ibrahim", "R1", null, 0],
  [2, 4, 6, 6, "Object Oriented Programming", "P", null, "S04", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 4, 6, 6, "Probability and Statistics-2", "P", null, "S06", null, "Eng. Marihan", "R4", null, 0],
  [2, 4, 8, 8, "Object Oriented Programming", "P", null, "S06", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 5, 3, 3, "Computer Networks Technology", "P", null, "S04", null, "Eng. Amany", "Lab 2", null, 0],
  [2, 5, 4, 4, "Introduction to Database systems", "P", null, "S04", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 5, 4, 4, "Introduction to Software Engineering", "P", null, "S05", null, "Eng. M-Attia", "R2", null, 0],
  [2, 5, 5, 5, "Introduction to Database systems", "P", null, "S05", null, "Eng. Omnia", "Lab 1", null, 0],
  [2, 5, 7, 7, "Object Oriented Programming", "L", "A", null, "VCR", "Dr. Yasser", "R1", null, 0],
  [2, 5, 7, 7, "Object Oriented Programming", "L", "B", null, "FTF", "Dr. Yasser", "R1", null, 0],
  [2, 5, 8, 8, "Probability and Statistics-2", "L", "A", null, "VCR", "Dr. Abdelbaset", "R1", null, 0],
  [2, 5, 8, 8, "Probability and Statistics-2", "L", "B", null, "FTF", "Dr. Abdelbaset", "R1", null, 0],
  [2, 5, 9, 9, "Introduction to Software Engineering", "L", "A", null, "VCR", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [2, 5, 9, 9, "Introduction to Software Engineering", "L", "B", null, "FTF", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [3, 0, 1, 2, "Network Routing and Switching-Lab", "P", null, "S03", null, "Eng. Marihan", "Lab 1", null, 0],
  [3, 0, 2, 2, "Digital Signal Processor", "P", null, "S01", null, "Eng. M-Kamal", "R2", null, 0],
  [3, 0, 3, 3, "Artificial Intelligence", "P", null, "S01", null, "Eng. M-Attia", "Lab 1", null, 0],
  [3, 0, 4, 4, "Computer Organization", "L", "A", null, "FTF", "Dr. Sayed Dahshan", "R1", null, 0],
  [3, 0, 4, 4, "Computer Organization", "L", "B", null, "VCR", "Dr. Sayed Dahshan", "R1", null, 0],
  [3, 0, 5, 5, "Artificial Intelligence", "L", null, null, null, "Dr. Bassiouni", "R1", "Group and delivery mode not printed in source; shown for every group of this year", 1],
  [3, 0, 5, 5, "Operating systems", "L", "A", null, "FTF", "Dr. Wafaa Samy", "R4", null, 0],
  [3, 0, 5, 5, "Operating systems", "L", "B", null, "VCR", "Dr. Wafaa Samy", "R4", null, 0],
  [3, 0, 6, 6, "Artificial Intelligence", "L", "A", null, "FTF", "Dr. Mahmoud Bassiouni", "R1", null, 0],
  [3, 0, 6, 6, "Artificial Intelligence", "L", "B", null, "VCR", "Dr. Mahmoud Bassiouni", "R1", null, 0],
  [3, 0, 8, 9, "Network Routing and Switching-Lab", "P", null, "S02", null, "Eng. M-Kamal", "Lab 1", null, 0],
  [3, 1, 2, 2, "Artificial Intelligence", "P", null, "S02", null, "Eng. M-Attia", "Lab 1", null, 0],
  [3, 1, 2, 2, "Computer Organization", "P", null, "S01", null, "Eng. M-Al-Banna", "R2", null, 0],
  [3, 1, 2, 2, "Computer Organization", "P", null, "S03", null, "Eng. Amany", "R4", null, 0],
  [3, 1, 3, 3, "Artificial Intelligence", "P", null, "S03", null, "Eng. M-Attia", "Lab 1", null, 0],
  [3, 1, 3, 3, "Digital Signal Processor", "P", null, "S02", null, "Eng. M-Kamal", "Lab 3", null, 0],
  [3, 1, 3, 4, "Network Routing and Switching-Lab", "P", null, "S01", null, "Eng. Amany", "Lab 2", null, 0],
  [3, 1, 5, 5, "Computer Organization", "P", null, "S02", null, "Eng. Amany", "R4", null, 0],
  [3, 1, 5, 5, "Digital Signal Processor", "P", null, "S03", null, "Eng. M-Attia", "R2", null, 0],
  [3, 1, 6, 6, "Digital Signal Processor", "L", "A", null, "FTF", "Dr. Reham Adel", "R1", null, 0],
  [3, 1, 6, 6, "Digital Signal Processor", "L", "B", null, "VCR", "Dr. Reham Adel", "R1", null, 0],
  [3, 1, 7, 7, "Algorithms analysis and design", "L", "A", null, "FTF", "Dr. Ahmed hamza", "R4", null, 0],
  [3, 1, 7, 7, "Algorithms analysis and design", "L", "B", null, "VCR", "Dr. Ahmed hamza", "R4", null, 0],
  [3, 1, 7, 7, "Algorithms analysis and design", "L", null, null, "VCR", "Dr. Reham Adel", "R1", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [3, 2, 4, 4, "Network Routing and Switching-Lab", "L", "A", null, "VCR", "Dr. M.Ashour + M-Al-Banna", "R2", "Second name printed in the cell", 0],
  [3, 2, 4, 4, "Network Routing and Switching-Lab", "L", "B", null, "VCR", "Dr. M.Ashour + M-Al-Banna", "R2", "Second name printed in the cell", 0],
  [3, 3, 1, 1, "Algorithms analysis and design", "P", null, "S04", null, "Eng. Amany", "Lab 1", null, 0],
  [3, 3, 1, 1, "Digital Signal Processor", "P", null, "S05", null, "Eng. M-Al-Banna", "R3", null, 0],
  [3, 3, 2, 2, "Digital Signal Processor", "P", null, "S07", null, "Eng. M-Al-Banna", "R2", null, 0],
  [3, 3, 2, 2, "Operating systems", "P", null, "S05", null, "Eng. Marihan", "Lab 2", null, 0],
  [3, 3, 3, 3, "Computer Organization", "P", null, "S04", null, "Eng. M-Al-Banna", "R2", null, 0],
  [3, 3, 4, 4, "Computer Organization", "L", "A", null, "VCR", "Dr. Sayed Dahshan", "R1", null, 0],
  [3, 3, 4, 4, "Computer Organization", "L", "B", null, "FTF", "Dr. Sayed Dahshan", "R1", null, 0],
  [3, 3, 5, 5, "Artificial Intelligence", "L", null, null, "VCR", "Dr. Mahmoud Bassiouni", "R1", "No group printed in source; shown for every group of this year", 1],
  [3, 3, 5, 5, "Operating systems", "L", "A", null, "VCR", "Dr. Wafaa Samy", "R4", null, 0],
  [3, 3, 5, 5, "Operating systems", "L", "B", null, "FTF", "Dr. Wafaa Samy", "R4", null, 0],
  [3, 3, 6, 6, "Artificial Intelligence", "L", "A", null, "VCR", "Dr. Mahmoud Bassiouni", "R1", null, 0],
  [3, 3, 6, 6, "Artificial Intelligence", "L", "B", null, "FTF", "Dr. Mahmoud Bassiouni", "R1", null, 0],
  [3, 4, 2, 2, "Digital Signal Processor", "P", null, "S04", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [3, 4, 3, 3, "Digital Signal Processor", "P", null, "S06", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [3, 4, 3, 4, "Network Routing and Switching-Lab", "P", null, "S04", null, "Eng. Marihan", "Lab 2", null, 0],
  [3, 4, 6, 6, "Digital Signal Processor", "L", "A", null, "VCR", "Dr. Reham Adel", "R1", null, 0],
  [3, 4, 6, 6, "Digital Signal Processor", "L", "B", null, "FTF", "Dr. Reham Adel", "R1", null, 0],
  [3, 4, 7, 7, "Algorithms analysis and design", "L", "A", null, "VCR", "Dr. Ahmed hamza", "R4", null, 0],
  [3, 4, 7, 7, "Algorithms analysis and design", "L", "B", null, "FTF", "Dr. Ahmed hamza", "R4", null, 0],
  [3, 4, 7, 7, "Algorithms analysis and design", "L", null, null, "VCR", "Dr. Reham Adel", "R1", "No group printed in source; shown for every group of this year", 1],
  [3, 4, 8, 8, "Algorithms analysis and design", "P", null, "S05", null, "Eng. M-Kamal", "Lab 2", null, 0],
  [3, 5, 1, 2, "Network Routing and Switching-Lab", "P", null, "S06", null, "Eng. Marihan", "Lab 1", null, 0],
  [3, 5, 2, 2, "Algorithms analysis and design", "P", null, "S03", null, "Eng. Amany", "Lab 2", null, 0],
  [3, 5, 3, 4, "Network Routing and Switching-Lab", "P", null, "S05", null, "Eng. M-Kamal", "Lab 3", null, 0],
  [3, 5, 3, 3, "Operating systems", "P", null, "S03", null, "Eng. Marihan", "Lab 1", null, 0],
  [3, 5, 4, 4, "Operating systems", "P", null, "S01", null, "Eng. Marihan", "Lab 2", null, 0],
  [3, 5, 5, 5, "Algorithms analysis and design", "P", null, "S01", null, "Eng. Amany", "R2", null, 0],
  [3, 5, 5, 5, "Artificial Intelligence", "P", null, "S04", null, "Eng. M-Attia", "Lab 2", null, 0],
  [3, 5, 5, 5, "Operating systems", "P", null, "S02", null, "Eng. Marihan", "Lab 3", null, 0],
  [3, 5, 6, 6, "Algorithms analysis and design", "P", null, "S02", null, "Eng. M-Kamal", "Lab 1", null, 0],
  [3, 5, 6, 6, "Artificial Intelligence", "P", null, "S05", null, "Eng. M-Attia", "Lab 2", null, 0],
  [3, 5, 6, 6, "Operating systems", "P", null, "S04", null, "Eng. Marihan", "Lab 3", null, 0],
  [3, 5, 7, 7, "Computer Organization", "P", null, "S05", null, "Eng. Amany", "R4", null, 0],
  [4, 0, 1, 1, "Advanced Computer Networks", "L", "A", null, "FTF", "Dr. Shimaa Mosaad", "R2", null, 0],
  [4, 0, 1, 1, "Advanced Computer Networks", "L", "B", null, "VCR", "Dr. Shimaa Mosaad", "R2", null, 0],
  [4, 0, 3, 3, "Computer Graphics", "L", "A", null, "FTF", "Dr. Wafaa Samy", "R4", null, 0],
  [4, 0, 3, 3, "Computer Graphics", "L", "B", null, "VCR", "Dr. Wafaa Samy", "R4", null, 0],
  [4, 0, 4, 4, "Advanced Computer Networks", "P", null, "S03", null, "Eng. Amany", "Lab 1", null, 0],
  [4, 0, 4, 5, "Selected labs in Software Engineering", "P", null, "S02", null, "Eng. Sama", "Lab 2", null, 0],
  [4, 0, 6, 7, "Selected labs in Software Engineering", "P", null, "S01", null, "Eng. Sama", "Lab 2", null, 0],
  [4, 0, 7, 7, "Advanced Computer Networks", "P", null, "S02", null, "Eng. Amany", "Lab 1", null, 0],
  [4, 1, 4, 4, "Computer Graphics", "P", null, "S03", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [4, 1, 4, 4, "Embedded Systems", "P", null, "S02", null, "Eng. M-Kamal", "Lab 1", null, 0],
  [4, 1, 5, 5, "Computer Graphics", "P", null, "S02", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [4, 1, 5, 6, "Selected labs in Software Engineering", "P", null, "S03", null, "Eng. Sama", "Lab 1", null, 0],
  [4, 1, 6, 6, "Communication Technology", "P", null, "S02", null, "Eng. Omnia", "R2", null, 0],
  [4, 1, 6, 6, "Computer Graphics", "P", null, "S01", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [4, 1, 7, 7, "Advanced Computer Networks", "P", null, "S01", null, "Eng. Amany", "Lab 2", null, 0],
  [4, 1, 8, 8, "Communication Technology", "L", "A", null, "FTF", "Dr. Reham Adel", "R1", null, 0],
  [4, 1, 8, 8, "Communication Technology", "L", "B", null, "VCR", "Dr. Reham Adel", "R1", null, 0],
  [4, 1, 9, 9, "Embedded Systems", "L", "A", null, "FTF", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [4, 1, 9, 9, "Embedded Systems", "L", "B", null, "VCR", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [4, 2, 4, 4, "Selected labs in Software Engineering", "L", null, null, "VCR", "Dr. M-Bassiouni", "R1", "No group printed in source; shown for every group of this year. Year inferred from course (no colour or IT label in cell)", 1],
  [4, 2, 5, 5, "Selected labs in Software Engineering", "L", "A", null, "VCR", "Dr. M-Bassiouni + Sama", "R1", "Second name printed in the cell", 0],
  [4, 2, 5, 5, "Selected labs in Software Engineering", "L", "B", null, "VCR", "Dr. M-Bassiouni + Sama", "R1", "Second name printed in the cell", 0],
  [4, 3, 1, 1, "Advanced Computer Networks", "L", "A", null, "VCR", "Dr. Shimaa Mosaad", "R2", null, 0],
  [4, 3, 1, 1, "Advanced Computer Networks", "L", "B", null, "FTF", "Dr. Shimaa Mosaad", "R2", null, 0],
  [4, 3, 3, 3, "Computer Graphics", "L", "A", null, "VCR", "Dr. Wafaa Samy", "R4", null, 0],
  [4, 3, 3, 3, "Computer Graphics", "L", "B", null, "FTF", "Dr. Wafaa Samy", "R4", null, 0],
  [4, 3, 4, 4, "Advanced Computer Networks", "P", null, "S05", null, "Eng. Amany", "Lab 1", null, 0],
  [4, 3, 5, 6, "Selected labs in Software Engineering", "P", null, "S04", null, "Eng. Sama", "Lab 2", null, 0],
  [4, 4, 4, 4, "Computer Graphics", "P", null, "S05", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [4, 4, 5, 5, "Embedded Systems", "P", null, "S05", null, "Eng. M-Kamal", "Lab 1", null, 0],
  [4, 4, 6, 6, "Computer Graphics", "P", null, "S04", null, "Eng. M-Al-Banna", "Lab 3", null, 0],
  [4, 4, 7, 7, "Communication Technology", "P", null, "S05", null, "Eng. Omnia", "Lab 1", null, 0],
  [4, 4, 7, 7, "Embedded Systems", "P", null, "S04", null, "Eng. M-Kamal", "Lab 2", null, 0],
  [4, 4, 8, 8, "Communication Technology", "L", "A", null, "VCR", "Dr. Reham Adel", "R1", null, 0],
  [4, 4, 8, 8, "Communication Technology", "L", "B", null, "FTF", "Dr. Reham Adel", "R1", null, 0],
  [4, 4, 9, 9, "Embedded Systems", "L", "A", null, "VCR", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [4, 4, 9, 9, "Embedded Systems", "L", "B", null, "FTF", "Dr. Asmaa Jad Amin", "R1", null, 0],
  [4, 5, 1, 1, "Advanced Computer Networks", "P", null, "S04", null, "Eng. Amany", "Lab 2", null, 0],
  [4, 5, 2, 2, "Communication Technology", "P", null, "S04", null, "Eng. Omnia", "R2", null, 0],
  [4, 5, 2, 2, "Embedded Systems", "P", null, "S01", null, "Eng. M-Kamal", "Lab 3", null, 0],
  [4, 5, 3, 3, "Communication Technology", "P", null, "S01", null, "Eng. Omnia", "R2", null, 0],
  [4, 5, 6, 6, "Advanced Computer Networks", "P", null, "S06", null, "Eng. Amany", "R4", null, 0],
  [4, 5, 7, 7, "Communication Technology", "P", null, "S06", null, "Eng. Omnia", "R2", null, 0],
  [4, 5, 7, 7, "Embedded Systems", "P", null, "S03", null, "Eng. M-Kamal", "Lab 1", null, 0],
  [4, 5, 8, 8, "Communication Technology", "P", null, "S03", null, "Eng. Omnia", "R2", null, 0]
];

/* ---------- 2. Constants ---------- */
const SEMESTER_LABEL = 'Fall Semester 2026–2027';
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_SHORT = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const SESSION_TIMES = [['08:00', '09:00'], ['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'], ['12:00', '13:00'],
  ['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00']];
const GROUPS = ['A', 'B', 'C', 'D'];
const YEARS = {
  1: { label: 'First Year', sub: 'IT-1', primary: '#F97316', soft: '#FFF7ED', deep: '#C2410C', darkText: '#FB923C', onPrimaryDark: '#1A0F05' },
  2: { label: 'Second Year', sub: 'IT-2', primary: '#3B82F6', soft: '#EFF6FF', deep: '#1D4ED8', darkText: '#7DB0FF', onPrimaryDark: '#06142E' },
  3: { label: 'Third Year', sub: 'IT-3', primary: '#10B981', soft: '#ECFDF5', deep: '#047857', darkText: '#34D399', onPrimaryDark: '#04170F' },
  4: { label: 'Fourth Year', sub: 'IT-4', primary: '#6B7280', soft: '#F3F4F6', deep: '#374151', darkText: '#B4BBC6', onPrimaryDark: '#0E1116' }
};
const DEFAULT_THEME = { primary: '#2E765B', soft: '#EAF4EE', deep: '#173D32' };
const FILTERS = [{ id: 'all', label: 'All sessions' }, { id: 'ftf', label: 'FTF only' }, { id: 'vcr', label: 'VCR only' },
  { id: 'lecture', label: 'Lectures' }, { id: 'practical', label: 'Practical' }];
const ICONS = {
  building: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9 21v-5h6v5M8 9h2M14 9h2M8 13h2M14 13h2"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3v18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
  alert: '<path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  sessions: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  sunrise: '<path d="M12 3v4M5 12H3M21 12h-2M7 9L5.5 7.5M17 9l1.5-1.5M3 19h18M7 19a5 5 0 0 1 10 0"/>',
  sunset: '<path d="M12 7V3M5 12H3M21 12h-2M3 19h18M7 19a5 5 0 0 1 10 0M9 5l3 3 3-3"/>',
  empty: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M9 15h6"/>'
};

/* ---------- 3. Pure data helpers ---------- */
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad2 = n => String(n).padStart(2, '0');
const toMinutes = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const fromMinutes = min => `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
const formatRange = s => `${s.startTime}–${s.endTime}`;
const formatDuration = min => { const h = Math.floor(min / 60), m = min % 60; return m ? `${h}h ${m}m` : `${h}h`; };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Normalised, frozen session records built once from SOURCE_ROWS. */
const SESSIONS = SOURCE_ROWS.map(r => {
  const [academicYear, dayIdx, s1, s2, courseName, kind, group, section, deliveryMode, instructor, location, note, nv] = r;
  const startTime = SESSION_TIMES[s1 - 1][0], endTime = SESSION_TIMES[s2 - 1][1];
  return Object.freeze({
    id: `y${academicYear}-${DAY_SHORT[dayIdx].toLowerCase()}-s${s1}${s2 !== s1 ? '-' + s2 : ''}-${slug(courseName)}-${(group || section || 'all').toLowerCase()}`,
    academicYear, dayIdx, day: DAYS[dayIdx], startTime, endTime, startMin: toMinutes(startTime), endMin: toMinutes(endTime),
    courseName, classType: kind === 'L' ? 'Lecture' : 'Practical', group, section, deliveryMode, instructor, location,
    note: note || null, needsVerification: !!nv, sourceVerified: true
  });
});

function getAvailableGroups(year) {
  const found = new Set(SESSIONS.filter(s => s.academicYear === year && s.group).map(s => s.group));
  return GROUPS.filter(g => found.has(g));
}
function getAvailableSections(year) {
  return [...new Set(SESSIONS.filter(s => s.academicYear === year && s.section).map(s => s.section))].sort();
}
function validateSelections(sel) {
  const errors = [];
  if (!sel.year || !YEARS[sel.year]) errors.push('Choose your academic year.');
  else {
    if (!sel.group) errors.push('Choose your academic group.');
    else if (!getAvailableGroups(sel.year).includes(sel.group)) errors.push(`Group ${sel.group} is not listed for ${YEARS[sel.year].label} in the source timetable.`);
    if (sel.section && !getAvailableSections(sel.year).includes(sel.section)) errors.push(`Section ${sel.section} is not listed for ${YEARS[sel.year].label}.`);
  }
  return { ok: errors.length === 0, errors };
}
function sortScheduleByTime(list) {
  return [...list].sort((a, b) => a.dayIdx - b.dayIdx || a.startMin - b.startMin || a.endMin - b.endMin || a.courseName.localeCompare(b.courseName));
}
/** Lectures: same year and (same group or no group printed). Practical: same year and chosen section. */
function getScheduleForSelection(sel) {
  if (!validateSelections(sel).ok) return [];
  return sortScheduleByTime(SESSIONS.filter(s => s.academicYear === sel.year && (
    (s.classType === 'Lecture' && (s.group === sel.group || s.group === null)) ||
    (s.classType === 'Practical' && sel.section && s.section === sel.section))));
}
function applyScheduleFilters(list, id) {
  switch (id) {
    case 'ftf': return list.filter(s => s.deliveryMode === 'FTF');
    case 'vcr': return list.filter(s => s.deliveryMode === 'VCR');
    case 'lecture': return list.filter(s => s.classType === 'Lecture');
    case 'practical': return list.filter(s => s.classType === 'Practical');
    default: return list;
  }
}
/** Never removes or edits sessions; only reports overlaps. */
function detectScheduleConflicts(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    if (a.dayIdx === b.dayIdx && a.startMin < b.endMin && b.startMin < a.endMin) out.push({ a, b, uncertain: a.needsVerification || b.needsVerification });
  }
  return out;
}
function calculateScheduleInsights(list) {
  const ftf = list.filter(s => s.deliveryMode === 'FTF').length, vcr = list.filter(s => s.deliveryMode === 'VCR').length;
  return {
    total: list.length, ftf, vcr, unknownMode: list.length - ftf - vcr,
    minutes: list.reduce((t, s) => t + (s.endMin - s.startMin), 0), teachingDays: new Set(list.map(s => s.dayIdx)).size,
    earliest: list.length ? fromMinutes(Math.min(...list.map(s => s.startMin))) : null,
    latest: list.length ? fromMinutes(Math.max(...list.map(s => s.endMin))) : null
  };
}
/** Lane assignment so overlapping cards sit side by side instead of hiding each other. */
function assignLanes(daySessions) {
  const sorted = [...daySessions].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const result = [];
  let cluster = [], clusterEnd = -1;
  const flush = () => {
    const laneEnds = [], assigned = [];
    cluster.forEach(s => {
      let lane = laneEnds.findIndex(end => end <= s.startMin);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
      laneEnds[lane] = s.endMin; assigned.push({ s, lane });
    });
    assigned.forEach(x => result.push({ s: x.s, lane: x.lane, lanes: laneEnds.length }));
    cluster = [];
  };
  sorted.forEach(s => {
    if (cluster.length && s.startMin >= clusterEnd) { flush(); clusterEnd = -1; }
    cluster.push(s); clusterEnd = Math.max(clusterEnd, s.endMin);
  });
  if (cluster.length) flush();
  return result;
}
const modeKey = s => s.deliveryMode === 'FTF' ? 'ftf' : s.deliveryMode === 'VCR' ? 'vcr' : 'unk';
const modeText = s => s.deliveryMode === 'FTF' ? 'On Campus' : s.deliveryMode === 'VCR' ? 'Online' : 'Mode not specified';
const sessionTypeLabel = s => s.classType === 'Practical' ? `Practical ${s.section || ''}`.trim() : `Lecture${s.group ? ' · Group ' + s.group : ''}`;
const metaLine = s => [s.instructor, s.location].filter(Boolean).join(' · ');
const infoLine = s => [sessionTypeLabel(s), s.instructor, s.location].filter(Boolean).join(' · ');
function buildFileName(sel, scope, filterId, theme) {
  const parts = ['UniSchedule', `Year${sel.year}`, `Group${sel.group}`];
  if (sel.section) parts.push(sel.section);
  if (scope === 'filtered' && filterId !== 'all') parts.push(filterId.toUpperCase());
  if (theme === 'dark') parts.push('Dark');
  return parts.join('_').replace(/[^A-Za-z0-9_-]/g, '') + '.png';
}

/* ---------- 4. State ---------- */
const state = { theme: 'light', sel: { year: null, group: null, section: null }, generated: null, view: 'week', filter: 'all', mobileDay: 'all', exporting: false };
const $ = id => document.getElementById(id);
const mqMobile = window.matchMedia('(max-width: 720px)');
const isMobile = () => mqMobile.matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable: ignore */ } }
};

/* ---------- 5. UI helpers ---------- */
/** Safe element builder: text is always set via text nodes, never innerHTML. */
function el(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v; else if (k === 'style') node.style.cssText = v; else node.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c !== null && c !== undefined && c !== false) node.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return node;
}
function icon(name, cls = 'icon') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  if (cls) svg.setAttribute('class', cls);
  svg.innerHTML = ICONS[name] || ''; // trusted constants only
  return svg;
}
function modeBadge(s, short = false) {
  const k = modeKey(s);
  if (k === 'unk') return el('span', { class: 'badge unk' }, short ? 'No mode' : 'Mode not specified');
  return el('span', { class: `badge ${k}` }, icon(k === 'ftf' ? 'building' : 'monitor', ''), s.deliveryMode, short ? null : el('span', { class: 'sup' }, '· ' + modeText(s)));
}
function announce(msg) { const r = $('liveRegion'); r.textContent = ''; setTimeout(() => { r.textContent = msg; }, 30); }
function toast(msg, kind = 'info') {
  const t = el('div', { class: `toast ${kind}`, role: kind === 'err' ? 'alert' : 'status' }, msg);
  $('toasts').append(t); setTimeout(() => t.remove(), 5000);
}
function hydrateIcons() {
  document.querySelectorAll('[data-icon]').forEach(h => { if (!h.firstChild) h.append(icon(h.dataset.icon)); h.style.display = 'inline-flex'; });
}

/* Theme */
function loadThemePreference() {
  const saved = store.get('unischedule-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function setTheme(theme, persist = true) {
  state.theme = theme;
  const root = document.documentElement;
  root.classList.add('theme-anim'); root.setAttribute('data-theme', theme);
  setTimeout(() => root.classList.remove('theme-anim'), 400);
  const btn = $('themeToggle');
  btn.setAttribute('aria-pressed', String(theme === 'dark'));
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  if (persist) store.set('unischedule-theme', theme);
  updateYearTheme(state.sel.year);
}
/** Writes --year-* variables. Action/text colours are chosen per theme for contrast. */
function updateYearTheme(year) {
  const y = YEARS[year], t = y || DEFAULT_THEME, dark = state.theme === 'dark', st = document.documentElement.style;
  st.setProperty('--year-primary', t.primary); st.setProperty('--year-soft', t.soft); st.setProperty('--year-deep', t.deep);
  st.setProperty('--year-action', dark ? (y ? t.primary : '#72C9A0') : t.deep);
  st.setProperty('--year-action-text', dark ? (y ? y.onPrimaryDark : '#0B100F') : '#FFFFFF');
  st.setProperty('--year-text', dark ? (y ? y.darkText : '#72C9A0') : t.deep);
}

/* Selection UI */
function renderYearCards() {
  $('yearGrid').replaceChildren(...Object.entries(YEARS).map(([n, y]) =>
    el('label', { class: 'year-card', style: `--yc:${y.primary}` },
      el('input', { type: 'radio', name: 'year', value: n, 'aria-label': y.label }),
      el('span', { class: 'face' }, el('span', { class: 'swatch' }), el('span', { class: 'y-name' }, y.label), el('span', { class: 'y-sub' }, `${y.sub} · Level ${n}`)),
      el('span', { class: 'tick', 'aria-hidden': 'true' }, icon('check', '')))));
}
function renderGroupOptions() {
  const year = state.sel.year, avail = year ? getAvailableGroups(year) : [];
  $('groupRow').replaceChildren(...GROUPS.map(g => {
    const ok = avail.includes(g);
    return el('label', { class: 'chip', title: year && !ok ? `Group ${g} is not listed for ${YEARS[year].label} in the source timetable.` : null },
      el('input', { type: 'radio', name: 'group', value: g, disabled: !year || !ok, checked: state.sel.group === g, 'aria-label': `Group ${g}${year && !ok ? ' (not in source timetable)' : ''}` }),
      el('span', null, `Group ${g}`));
  }));
  $('groupHelper').textContent = !year ? 'Choose your academic year first.'
    : `Listed for ${YEARS[year].label}: ${avail.map(g => 'Group ' + g).join(', ')}. Other groups are disabled because the source timetable does not include them.`;
}
function renderSectionOptions() {
  const year = state.sel.year, row = $('sectionRow');
  if (!year) { row.replaceChildren(); $('sectionHelper').textContent = 'Choose your academic year first.'; return; }
  const secs = getAvailableSections(year);
  if (!secs.length) { row.replaceChildren(); $('sectionHelper').textContent = 'No practical sections are listed for this year in the source timetable.'; return; }
  row.replaceChildren(
    el('label', { class: 'chip' }, el('input', { type: 'radio', name: 'section', value: '', checked: !state.sel.section, 'aria-label': 'No section, lectures only' }), el('span', null, 'Lectures only')),
    ...secs.map(s => el('label', { class: 'chip' }, el('input', { type: 'radio', name: 'section', value: s, checked: state.sel.section === s, 'aria-label': `Section ${s}` }), el('span', null, s))));
  $('sectionHelper').textContent = `${secs.length} sections listed for ${YEARS[year].label} (${secs[0]}–${secs[secs.length - 1]}). Sections apply to practical sessions; the source does not tie them to a group.`;
}
function updateStepStates() {
  const { year, group, section } = state.sel;
  const set = (id, locked, done, active) => { const s = $(id); s.classList.toggle('locked', locked); s.classList.toggle('done', done); s.classList.toggle('active', active); };
  set('step1', false, !!year, !year); set('step2', !year, !!group, !!year && !group); set('step3', !year, !!section, !!group && !section);
  $('pg1').classList.toggle('done', !!year); $('pg2').classList.toggle('done', !!group); $('pg3').classList.toggle('done', !!section);
  $('hint1').textContent = year ? YEARS[year].label : 'Required';
  $('hint2').textContent = group ? `Group ${group}` : 'Required';
  $('hint3').textContent = section || 'Optional';
  $('resetBtn').hidden = !(year || state.generated);
}
function renderPreview() {
  const body = $('previewBody'), { year, group, section } = state.sel, pill = $('previewPill');
  if (!year) {
    pill.textContent = 'Not started';
    body.replaceChildren(el('div', { class: 'preview-empty' }, icon('empty', 'icon'), 'Your selection summary and a small weekly preview will appear here.'));
    return;
  }
  pill.textContent = YEARS[year].label;
  const list = el('ul', { class: 'summary-list' }, [['Year', YEARS[year].label], ['Group', group ? `Group ${group}` : 'Not selected'], ['Section', section || 'Lectures only']]
    .map(([k, v]) => el('li', null, el('span', null, k), el('span', null, v))));
  if (!validateSelections(state.sel).ok) { body.replaceChildren(list, el('div', { class: 'preview-empty' }, 'Choose a group to see your weekly preview.')); return; }
  const sessions = getScheduleForSelection(state.sel);
  list.append(el('li', null, el('span', null, 'Sessions'), el('span', null, String(sessions.length))));
  if (!sessions.length) { body.replaceChildren(list, el('div', { class: 'preview-empty' }, 'The source timetable does not contain enough information to build this schedule.')); return; }
  const minH = Math.floor(Math.min(...sessions.map(s => s.startMin)) / 60), maxH = Math.ceil(Math.max(...sessions.map(s => s.endMin)) / 60), span = (maxH - minH) * 60;
  const grid = el('div', { class: 'mini-grid', role: 'img', 'aria-label': 'Miniature weekly preview' });
  DAYS.forEach((d, i) => {
    const col = el('div', { class: 'mini-col' }, el('b', null, DAY_SHORT[i][0]));
    sessions.filter(s => s.dayIdx === i).forEach(s => col.append(el('span', { class: `mini-block${s.deliveryMode === 'VCR' ? ' vcr' : ''}`, style: `top:${(s.startMin - minH * 60) / span * 100}%;height:${(s.endMin - s.startMin) / span * 100 - 1}%` })));
    grid.append(col);
  });
  body.replaceChildren(list, el('div', { class: 'mini-wrap' }, grid), el('p', { class: 'helper' }, `${fromMinutes(minH * 60)}–${fromMinutes(maxH * 60)}. Solid: FTF or unspecified. Striped: VCR.`));
}
function setFormMessage(text, kind = 'info') { const m = $('formMsg'); m.className = `inline-msg ${kind}`; m.textContent = text; }
function refreshSelectionUI() {
  renderGroupOptions(); renderSectionOptions(); updateStepStates(); renderPreview(); updateStaleBar();
  setFormMessage(validateSelections(state.sel).ok ? 'Ready. Generate your schedule when you are happy with the selection.'
    : state.sel.year ? 'Choose your academic group to continue.' : 'Select your year and group to begin.');
}
/** Parent changes reset dependents that are no longer valid. */
function onYearChange(year) {
  state.sel.year = year;
  if (!getAvailableGroups(year).includes(state.sel.group)) state.sel.group = null;
  if (!getAvailableSections(year).includes(state.sel.section)) state.sel.section = null;
  updateYearTheme(year); refreshSelectionUI();
}
function resetSelections() {
  state.sel = { year: null, group: null, section: null }; state.generated = null; state.filter = 'all'; state.view = 'week'; state.mobileDay = 'all';
  document.querySelectorAll('input[name="year"]').forEach(i => { i.checked = false; });
  updateYearTheme(null); $('results').hidden = true; refreshSelectionUI(); announce('Selections reset.');
  $('builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Results */
const sameSel = (a, b) => a.year === b.year && a.group === b.group && (a.section || null) === (b.section || null);
const selLabel = sel => `${YEARS[sel.year].label} · Group ${sel.group} · ${sel.section || 'Lectures only'}`;
function updateStaleBar() {
  const bar = $('staleBar');
  if (!state.generated) { bar.hidden = true; return; }
  const stale = !sameSel(state.sel, state.generated.sel);
  bar.hidden = !stale;
  if (stale) {
    const cur = state.sel.year && state.sel.group ? selLabel(state.sel) : 'an incomplete selection';
    $('staleText').textContent = `This timetable shows your previous selection (${selLabel(state.generated.sel)}). Your current choice is ${cur}. Regenerate to update.`;
    $('regenBtn').disabled = !validateSelections(state.sel).ok;
  }
}
function generateSchedule(focus = true) {
  const v = validateSelections(state.sel);
  if (!v.ok) { setFormMessage(v.errors[0], 'error'); announce(v.errors[0]); return; }
  const sessions = getScheduleForSelection(state.sel);
  if (!sessions.length) {
    state.generated = null; $('results').hidden = true;
    const m = 'The source timetable does not contain enough verified information to generate this schedule.';
    setFormMessage(m, 'error'); announce(m); return;
  }
  state.generated = { sel: { ...state.sel }, sessions };
  state.filter = 'all'; state.mobileDay = 'all';
  if (isMobile()) state.view = 'agenda';
  renderSchedule(); updateStepStates();
  const res = $('results'); res.hidden = false;
  res.classList.remove('reveal'); void res.offsetWidth; res.classList.add('reveal');
  announce(`Schedule generated: ${sessions.length} sessions for ${selLabel(state.sel)}.`);
  setFormMessage(`Schedule generated with ${sessions.length} sessions.`);
  if (focus) { res.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('resultTitle').focus({ preventScroll: true }); }
}
const getDisplayed = () => state.generated ? applyScheduleFilters(state.generated.sessions, state.filter) : [];
function renderSchedule() {
  const g = state.generated; if (!g) return;
  const { sel, sessions } = g, name = $('nameInput').value.trim();
  $('resultMeta').replaceChildren(...[YEARS[sel.year].label, `Group ${sel.group}`, sel.section ? `Section ${sel.section}` : 'Lectures only', SEMESTER_LABEL, plural(sessions.length, 'session')].map(t => el('span', { class: 'pill' }, t)));
  $('resultFor').textContent = name ? `Prepared for ${name}` : '';
  renderInsights(sessions); renderConflicts(sessions); renderLegend(); renderFilters(); renderDayTabs(); renderViewHost();
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
  updateStaleBar();
}
function renderInsights(sessions) {
  const m = calculateScheduleInsights(sessions);
  const card = (ic, label, value) => el('div', { class: 'metric' }, el('div', { class: 'm-top' }, icon(ic, 'icon icon-sm'), label), el('div', { class: 'm-val' }, value));
  $('insights').replaceChildren(card('sessions', 'Sessions', String(m.total)), card('building', 'FTF · On Campus', String(m.ftf)), card('monitor', 'VCR · Online', String(m.vcr)),
    card('clock', 'Academic hours', formatDuration(m.minutes)), card('cal', 'Teaching days', String(m.teachingDays)), card('sunrise', 'Earliest start', m.earliest || '—'), card('sunset', 'Latest end', m.latest || '—'));
  const notes = [];
  if (m.unknownMode) notes.push(`${plural(m.unknownMode, 'session')} ${m.unknownMode > 1 ? 'have' : 'has'} no delivery mode in the source, so FTF and VCR counts cover only the ${m.ftf + m.vcr} of ${m.total} sessions with a printed mode.`);
  notes.push('Hours add up every listed session, including overlapping ones.');
  $('insightNote').textContent = notes.join(' ');
}
function renderConflicts(sessions) {
  const box = $('conflicts'), conflicts = detectScheduleConflicts(sessions);
  if (!conflicts.length) { box.hidden = true; box.replaceChildren(); return; }
  const verified = conflicts.filter(c => !c.uncertain).length;
  box.replaceChildren(
    el('h3', { id: 'conflictTitle' }, icon('alert', 'icon'), `${plural(conflicts.length, 'potential conflict')} found`),
    el('ul', null, conflicts.map(c => el('li', null, `${c.a.day}: “${c.a.courseName}” (${formatRange(c.a)}) overlaps “${c.b.courseName}” (${formatRange(c.b)}). `,
      el('strong', null, c.uncertain ? 'Needs verification: the source does not state the group for one of these sessions.' : 'Verified conflict in the source timetable.')))),
    el('p', { class: 'small' }, `${verified} verified, ${conflicts.length - verified} needing verification. All sessions stay visible and times are never altered.`));
  box.hidden = false;
}
function renderLegend() {
  $('legend').replaceChildren(
    el('span', { class: 'badge ftf' }, icon('building', ''), 'FTF', el('span', { class: 'sup' }, '· On Campus')),
    el('span', { class: 'badge vcr' }, icon('monitor', ''), 'VCR', el('span', { class: 'sup' }, '· Online')),
    el('span', { class: 'badge unk' }, 'Mode not specified'));
}
function renderFilters() {
  const base = state.generated.sessions;
  $('filterRow').replaceChildren(...FILTERS.map(f => el('button', { type: 'button', class: 'filter-btn', 'data-filter': f.id, 'aria-pressed': String(state.filter === f.id) }, `${f.label} (${applyScheduleFilters(base, f.id).length})`)));
  const st = $('filterState');
  if (state.filter === 'all') st.textContent = `Showing all ${plural(base.length, 'session')}.`;
  else st.replaceChildren('Filter: ', el('strong', null, FILTERS.find(f => f.id === state.filter).label), ` · ${getDisplayed().length} of ${base.length} shown`,
    el('button', { type: 'button', class: 'btn btn-ghost', 'data-action': 'reset-filter' }, 'Show all'));
}
function renderDayTabs() {
  const d = getDisplayed();
  $('dayTabs').replaceChildren(el('button', { type: 'button', 'data-day': 'all', 'aria-pressed': String(state.mobileDay === 'all') }, 'All days'),
    ...DAYS.map((n, i) => { const c = d.filter(s => s.dayIdx === i).length; return el('button', { type: 'button', class: c ? '' : 'empty', 'data-day': String(i), 'aria-pressed': String(state.mobileDay === i) }, `${DAY_SHORT[i]} · ${c}`); }));
}
function renderEmptyState(title, text, withReset) {
  const box = el('div', { class: 'empty-state' }, icon('empty', 'icon'), el('h3', null, title), el('p', null, text));
  if (withReset) box.append(el('button', { type: 'button', class: 'btn btn-secondary btn-sm', 'data-action': 'reset-filter' }, 'Show all sessions'));
  return box;
}
function renderViewHost() {
  const d = getDisplayed(), host = $('viewHost');
  if (!d.length) { host.replaceChildren(renderEmptyState('No sessions match this filter', 'Your timetable has sessions, but none match the active filter.', true)); return; }
  const dayList = isMobile() && state.mobileDay !== 'all' ? [state.mobileDay] : [0, 1, 2, 3, 4, 5];
  host.replaceChildren(state.view === 'week' ? renderWeeklyView(d, dayList) : renderDailyAgenda(d, dayList));
}
function conflictIds(list) { const ids = new Set(); detectScheduleConflicts(list).forEach(c => { ids.add(c.a.id); ids.add(c.b.id); }); return ids; }
function renderWeeklyView(displayed, dayList) {
  const minH = Math.floor(Math.min(...displayed.map(s => s.startMin)) / 60), maxH = Math.ceil(Math.max(...displayed.map(s => s.endMin)) / 60), rows = maxH - minH;
  const clash = conflictIds(state.generated.sessions);
  const week = el('div', { class: 'week', style: `--rows:${rows};--ndays:${dayList.length}` });
  week.append(el('div', { class: 'week-head' }, el('div', null, ''), ...dayList.map(i => el('div', null, DAYS[i], el('small', null, plural(displayed.filter(s => s.dayIdx === i).length, 'session'))))));
  const tc = el('div', { class: 'time-col' });
  for (let h = minH; h <= maxH; h++) {
    const lab = el('span', { style: `top:calc(${h - minH} * var(--row-h))` }, fromMinutes(h * 60));
    if (h === minH) lab.style.transform = 'translateY(4px)';
    if (h === maxH) lab.style.transform = 'translateY(-100%)';
    tc.append(lab);
  }
  week.append(tc);
  dayList.forEach(i => {
    const items = displayed.filter(s => s.dayIdx === i);
    const col = el('div', { class: `day-col${items.length ? '' : ' free'}`, role: 'group', 'aria-label': `${DAYS[i]}, ${plural(items.length, 'session')}` });
    assignLanes(items).forEach(({ s, lane, lanes }) => {
      const top = (s.startMin - minH * 60) / 60, h = (s.endMin - s.startMin) / 60;
      col.append(el('button', {
        type: 'button', 'data-id': s.id, class: `card mode-${modeKey(s)}${clash.has(s.id) ? ' conflict' : ''}${lanes > 1 ? ' compact' : ''}`,
        style: `top:calc(${top} * var(--row-h) + 2px);height:calc(${h} * var(--row-h) - 4px);left:calc(${lane / lanes * 100}% + 3px);width:calc(${100 / lanes}% - 6px)`,
        title: `${s.courseName}\n${formatRange(s)}\n${infoLine(s)}`,
        'aria-label': `${s.courseName}, ${s.day} ${formatRange(s)}, ${s.deliveryMode ? s.deliveryMode + ', ' + modeText(s) : 'mode not specified'}. Open details.`
      }, el('span', { class: 'c-time' }, formatRange(s), clash.has(s.id) ? el('span', { class: 'c-warn' }, ' ⚠ Overlap') : null),
        el('span', { class: 'c-title' }, s.courseName),
        el('span', { class: 'c-meta' }, modeBadge(s, lanes > 1)),
        el('span', { class: 'c-loc' }, lanes > 1 ? '' : infoLine(s))));
    });
    week.append(col);
  });
  return el('div', { class: 'week-scroll' }, week);
}
function renderDailyAgenda(displayed, dayList) {
  const clash = conflictIds(state.generated.sessions), agenda = el('div', { class: 'agenda' });
  dayList.forEach(i => {
    const items = sortScheduleByTime(displayed.filter(s => s.dayIdx === i));
    const sec = el('section', { class: 'agenda-day', 'aria-labelledby': `ag-${i}` }, el('h3', { id: `ag-${i}` }, DAYS[i], el('span', { class: 'count' }, items.length ? plural(items.length, 'session') : '')));
    if (!items.length) sec.append(el('div', { class: 'free-note' }, 'No scheduled class.'));
    else sec.append(el('ul', { class: 'agenda-list' }, items.map(s => el('li', null,
      el('button', { type: 'button', 'data-id': s.id, class: `agenda-item mode-${modeKey(s)}${clash.has(s.id) ? ' conflict' : ''}`, 'aria-label': `${s.courseName}, ${formatRange(s)}. Open details.` },
        el('div', { class: 'agenda-time' }, formatRange(s), el('small', null, formatDuration(s.endMin - s.startMin))),
        el('div', { class: 'agenda-main' }, el('h4', null, s.courseName),
          el('div', { class: 'row' }, modeBadge(s), el('span', { class: 'badge type' }, sessionTypeLabel(s)), clash.has(s.id) ? el('span', { class: 'badge warn' }, '⚠ Overlap') : null),
          metaLine(s) ? el('div', { class: 'sub' }, metaLine(s)) : null))))));
    agenda.append(sec);
  });
  return agenda;
}
function openDetail(id) {
  const s = SESSIONS.find(x => x.id === id); if (!s) return;
  const dlg = $('detailDialog'), row = (k, v) => [el('dt', null, k), el('dd', null, v || 'Not specified in source')];
  dlg.replaceChildren(el('div', { class: 'dlg' }, el('h3', null, s.courseName), el('div', { class: 'row' }, modeBadge(s), el('span', { class: 'badge type' }, sessionTypeLabel(s))),
    el('dl', null, ...row('Day', s.day), ...row('Time', `${formatRange(s)} (${formatDuration(s.endMin - s.startMin)})`), ...row('Year', YEARS[s.academicYear].label),
      ...row('Group', s.group ? 'Group ' + s.group : 'Not printed'), ...row('Section', s.section), ...row('Delivery', s.deliveryMode ? `${s.deliveryMode} — ${modeText(s)}` : null),
      ...row('Instructor', s.instructor), ...row('Room / Lab', s.location), ...(s.note ? row('Source note', s.note) : [])),
    el('div', { class: 'dlg-actions' }, el('button', { type: 'button', class: 'btn btn-primary btn-sm', 'data-action': 'close-dialog' }, 'Close'))));
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}

/* ---------- 6. Export engine ---------- */
function setExportStatus(text, kind) { const s = $('exportStatus'); s.textContent = text; s.className = `export-status ${kind || ''}`; }
function setExporting(on, label) {
  state.exporting = on; $('exportBtn').disabled = on; $('topExportBtn').disabled = on;
  $('exportLabel').textContent = label || 'Download PNG';
  $('exportBtn').querySelector('.spinner')?.remove();
  if (on) $('exportBtn').prepend(el('span', { class: 'spinner', 'aria-hidden': 'true' }));
}
const LOGO_SVG = '<svg viewBox="0 0 32 32"><rect x="3" y="5" width="26" height="23" rx="6" fill="#173D32"/><rect x="3" y="5" width="26" height="8" rx="6" fill="#2E765B"/><rect x="9" y="2.5" width="3" height="6" rx="1.5" fill="#173D32"/><rect x="20" y="2.5" width="3" height="6" rx="1.5" fill="#173D32"/><rect x="8" y="16" width="5" height="4" rx="1.2" fill="#fff"/><rect x="14" y="16" width="5" height="4" rx="1.2" fill="#fff" opacity=".6"/><rect x="20" y="16" width="4" height="4" rx="1.2" fill="#fff" opacity=".35"/><rect x="8" y="22" width="5" height="3" rx="1.2" fill="#fff" opacity=".6"/></svg>';
const LOGO_SVG_DARK = LOGO_SVG.replace(/#173D32/g, '#72C9A0').replace(/#2E765B/g, '#4FA67F').replace(/#fff/g, '#0F1613');
function xsBadge(s, short = false) {
  const k = modeKey(s);
  if (k === 'unk') return el('span', { class: 'xs-badge unk' }, short ? 'No mode' : 'Mode not specified');
  return el('span', { class: `xs-badge ${k}` }, icon(k === 'ftf' ? 'building' : 'monitor', ''), short ? s.deliveryMode : `${s.deliveryMode} · ${modeText(s)}`);
}
/** Export-only composition. Independent from the on-screen layout and theme, so exports are never clipped. */
function buildExportSheet(sessions, opts) {
  const { sel } = state.generated, y = YEARS[sel.year], portrait = opts.orientation === 'portrait', dark = opts.theme === 'dark', clash = conflictIds(state.generated.sessions);
  const sheet = el('div', { class: `xs${portrait ? ' portrait' : ''}${dark ? ' dark' : ''}`, style: `--xp:${y.primary};--xd:${dark ? y.darkText : y.deep};--xsoft:${y.soft}` });
  const logo = el('span', { style: 'display:inline-flex' }); logo.innerHTML = dark ? LOGO_SVG_DARK : LOGO_SVG; // constant markup
  sheet.append(el('div', { class: 'xs-head' },
    el('div', null, el('div', { class: 'xs-brand' }, logo, 'UniSchedule'), el('div', { class: 'xs-title' }, opts.name ? `${opts.name}’s Weekly Timetable` : 'Weekly Timetable'), el('div', { class: 'xs-sub' }, `${SEMESTER_LABEL} · ${plural(sessions.length, 'session')}`)),
    el('div', { class: 'xs-tags' }, [y.label, `Group ${sel.group}`, sel.section ? `Section ${sel.section}` : 'Lectures only'].map(t => el('span', { class: 'xs-tag' }, t)))));
  if (!portrait) {
    const minH = Math.floor(Math.min(...sessions.map(s => s.startMin)) / 60), maxH = Math.ceil(Math.max(...sessions.map(s => s.endMin)) / 60), rows = maxH - minH, RH = 156;
    const grid = el('div', { class: 'xs-grid', style: `--nd:6;--rows:${rows};--rh:${RH}px` });
    grid.append(el('div', { class: 'xs-gh' }, ''), ...DAYS.map(d => el('div', { class: 'xs-gh' }, d)));
    const tc = el('div', { class: 'xs-time' });
    for (let h = minH; h <= maxH; h++) tc.append(el('span', { class: h === minH ? 'first' : h === maxH ? 'last' : '', style: `top:${(h - minH) * RH}px` }, fromMinutes(h * 60)));
    grid.append(tc);
    DAYS.forEach((d, i) => {
      const items = sessions.filter(s => s.dayIdx === i), col = el('div', { class: `xs-day${items.length ? '' : ' free'}` });
      assignLanes(items).forEach(({ s, lane, lanes }) => col.append(el('div', {
        class: `xs-card ${modeKey(s)}${clash.has(s.id) ? ' conflict' : ''}${lanes > 1 ? ' narrow' : ''}`,
        style: `top:${(s.startMin - minH * 60) / 60 * RH + 3}px;height:${(s.endMin - s.startMin) / 60 * RH - 6}px;left:calc(${lane / lanes * 100}% + 4px);width:calc(${100 / lanes}% - 8px)`
      }, el('div', { class: 'xs-ct' }, formatRange(s), clash.has(s.id) ? el('span', { class: 'xs-ov' }, ' ⚠ Overlap') : null),
        el('div', { class: 'xs-cn' }, s.courseName), xsBadge(s, lanes > 1),
        lanes > 1 ? null : el('div', { class: 'xs-cm' }, infoLine(s)))));
      grid.append(col);
    });
    sheet.append(grid);
  } else {
    DAYS.forEach((d, i) => {
      const items = sortScheduleByTime(sessions.filter(s => s.dayIdx === i)); if (!items.length) return;
      const block = el('div', { class: 'xs-day-block' }, el('h3', null, d));
      items.forEach(s => block.append(el('div', { class: `xs-row ${modeKey(s)}${clash.has(s.id) ? ' conflict' : ''}` },
        el('div', { class: 'xs-ct' }, formatRange(s), clash.has(s.id) ? el('div', { class: 'xs-ov' }, '⚠ Overlap') : null),
        el('div', null, el('div', { class: 'xs-cn' }, s.courseName), el('div', { class: 'xs-line', style: 'margin-top:6px' }, xsBadge(s), el('span', { class: 'xs-cm' }, infoLine(s)))))));
      sheet.append(block);
    });
  }
  const n = detectScheduleConflicts(state.generated.sessions).length;
  if (n) sheet.append(el('div', { class: 'xs-conf' }, `${plural(n, 'overlapping session pair')} flagged (marked ⚠ Overlap). All sessions are shown; times are as printed in the source.`));
  if (opts.notes) sheet.append(el('div', { class: 'xs-notes' }, el('b', null, 'My notes: '), opts.notes));
  sheet.append(el('div', { class: 'xs-foot' },
    el('div', null, el('div', { class: 'xs-legend' }, el('span', { class: 'xs-badge ftf' }, icon('building', ''), 'FTF · On Campus'), el('span', { class: 'xs-badge vcr' }, icon('monitor', ''), 'VCR · Online'), el('span', { class: 'xs-badge unk' }, 'Mode not specified')),
      el('div', { style: 'margin-top:10px' }, 'Source: IT Schedule Fall Semester 2026–2027. Independent student tool, not an official document.')),
    el('div', { class: 'xs-gen' }, 'Generated with UniSchedule', opts.timestamp ? el('div', { class: 'xs-date' }, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })) : null)));
  return sheet;
}
function loadScriptOnce(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load')); document.head.append(s); }); }
async function ensureHtml2Canvas() {
  if (window.html2canvas) return true;
  try { await loadScriptOnce('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'); } catch (e) { /* reported by caller */ }
  return !!window.html2canvas;
}
async function exportScheduleToPNG() {
  if (state.exporting) return;
  if (!state.generated) { toast('Generate a schedule first.', 'err'); return; }
  const scope = $('exScope').value, theme = $('exTheme').value, sessions = scope === 'filtered' ? getDisplayed() : state.generated.sessions, stage = $('exportStage');
  if (!sessions.length) { setExportStatus('There are no sessions to export with the current filter.', 'err'); toast('Nothing to export for this filter.', 'err'); return; }
  try {
    setExporting(true, 'Preparing export…'); setExportStatus('Preparing export…'); announce('Preparing export.');
    if (!(await ensureHtml2Canvas())) throw new Error('lib');
    const sheet = buildExportSheet(sessions, { orientation: $('exOrientation').value, theme, name: $('nameInput').value.trim(), notes: $('exNotes').checked ? $('notesInput').value.trim() : '', timestamp: $('exTimestamp').checked });
    stage.replaceChildren(sheet);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    setExporting(true, 'Generating image…'); setExportStatus('Generating image…'); announce('Generating image.');
    let scale = $('exQuality').value === 'high' ? 3 : 2; const w = sheet.offsetWidth, h = sheet.offsetHeight;
    while (scale > 1 && w * h * scale * scale > 36e6) scale -= 1; // keep canvas within browser memory limits
    const canvas = await window.html2canvas(sheet, { scale, backgroundColor: theme === 'dark' ? '#0F1613' : '#FFFFFF', useCORS: true, logging: false, width: w, height: h, windowWidth: w });
    const blob = await new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/png'));
    const url = URL.createObjectURL(blob), a = el('a', { href: url, download: buildFileName(state.generated.sel, scope, state.filter, theme) });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    setExportStatus(`Download started (${canvas.width}×${canvas.height}px).`, 'ok'); toast('Download started. Check your downloads folder.', 'ok'); announce('Download started.');
  } catch (err) {
    const msg = err && err.message === 'lib' ? 'The export library could not be loaded. Check your connection and try again. The rest of the app still works.' : 'The image could not be generated. Try again or choose Standard quality.';
    setExportStatus(msg, 'err'); toast(msg, 'err'); announce('Export failed.');
  } finally { stage.replaceChildren(); setExporting(false); }
}

/* ---------- 7. Wiring ---------- */
function setFilter(id) { state.filter = id; renderFilters(); renderDayTabs(); renderViewHost(); announce(`${FILTERS.find(f => f.id === id).label}: ${getDisplayed().length} sessions shown.`); }
function initializeApp() {
  hydrateIcons(); renderYearCards(); setTheme(loadThemePreference(), false); refreshSelectionUI();
  $('themeToggle').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
  $('resetBtn').addEventListener('click', resetSelections);
  $('brandLink').addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('builder').addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'year') onYearChange(Number(t.value));
    else if (t.name === 'group') { state.sel.group = t.value; refreshSelectionUI(); }
    else if (t.name === 'section') { state.sel.section = t.value || null; refreshSelectionUI(); }
  });
  $('generateBtn').addEventListener('click', () => generateSchedule(true));
  $('regenBtn').addEventListener('click', () => generateSchedule(false));
  $('editBtn').addEventListener('click', () => { $('builder').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => (document.querySelector('input[name="year"]:checked') || document.querySelector('input[name="year"]')).focus({ preventScroll: true }), 400); });
  $('results').addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.view) { state.view = t.dataset.view; renderSchedule(); announce(t.dataset.view === 'week' ? 'Weekly view' : 'Daily agenda'); }
    else if (t.dataset.filter) setFilter(t.dataset.filter);
    else if (t.dataset.action === 'reset-filter') setFilter('all');
    else if (t.dataset.day) { state.mobileDay = t.dataset.day === 'all' ? 'all' : Number(t.dataset.day); renderDayTabs(); renderViewHost(); }
    else if (t.dataset.id) openDetail(t.dataset.id);
  });
  $('detailDialog').addEventListener('click', e => { if (e.target.closest('[data-action="close-dialog"]') || e.target === $('detailDialog')) $('detailDialog').close(); });
  $('nameInput').addEventListener('input', () => { if (state.generated) { const n = $('nameInput').value.trim(); $('resultFor').textContent = n ? `Prepared for ${n}` : ''; } });
  $('exportBtn').addEventListener('click', exportScheduleToPNG);
  $('topExportBtn').addEventListener('click', () => { $('exportBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); exportScheduleToPNG(); });
  mqMobile.addEventListener('change', () => { if (state.generated) renderSchedule(); });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!store.get('unischedule-theme')) setTheme(e.matches ? 'dark' : 'light', false); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeApp); else initializeApp();
