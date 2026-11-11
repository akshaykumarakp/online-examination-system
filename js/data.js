/**
 * Online Examination System - Initial Data Store
 * Contains predefined student accounts, admin accounts, examiner accounts, and examinations.
 */

const INITIAL_DATA = {
  users: [
    {
      id: "STU202601",
      name: "Priya Sharma",
      role: "student",
      password: "password123",
      email: "priya.sharma@presidencyuniversity.in",
      rollNo: "2026-CS-042",
      department: "Computer Science & Engineering",
      semester: "6th Semester",
      academicYear: "2025-2026"
    },
    {
      id: "STU202602",
      name: "Rahul Verma",
      role: "student",
      password: "password123",
      email: "rahul.verma@presidencyuniversity.in",
      rollNo: "2026-IT-018",
      department: "Information Technology",
      semester: "6th Semester",
      academicYear: "2025-2026"
    },
    {
      id: "ADMIN2026",
      name: "Prof. S. Narayanan",
      role: "admin",
      password: "admin123",
      email: "controller.exams@presidencyuniversity.in",
      rollNo: "ADM-EXAM-001",
      department: "Office of the Controller of Examinations",
      designation: "Chief Controller of Examinations"
    },
    {
      id: "EXAM2026",
      name: "Dr. K. Ramanathan",
      role: "examiner",
      password: "admin123",
      email: "k.ramanathan@presidencyuniversity.in",
      rollNo: "FAC-CS-108",
      department: "Department of Computer Science & Engineering",
      designation: "Professor & Chief Evaluator"
    }
  ],

  examinations: [
    {
      id: "EXAM-CS401",
      code: "CS401",
      title: "Data Structures & Algorithms",
      department: "Computer Science & Engineering",
      date: "2026-11-15",
      durationMinutes: 15,
      totalMarks: 20,
      passingMarks: 10,
      status: "available", // available, upcoming, completed
      instructions: [
        "Ensure a stable internet connection before commencing. If internet is temporarily lost, all your answers are preserved locally.",
        "The examination contains both Objective (Multiple Choice) and Descriptive questions.",
        "Objective questions carry 2 marks each; descriptive questions carry 6 marks each.",
        "Answers are automatically saved continuously as you type or select options.",
        "You can navigate freely, review, and modify your responses anytime before final submission.",
        "The question palette on the side indicates visited, answered, and flagged questions.",
        "When the countdown timer expires, your saved answers will be automatically submitted by the system.",
        "Objective questions are evaluated instantly, while descriptive answers will be reviewed by the appointed examiner."
      ],
      questions: [
        {
          id: 1,
          type: "objective",
          marks: 2,
          question: "Which of the following data structures operates strictly on the Last In, First Out (LIFO) principle?",
          options: [
            { key: "A", text: "Queue" },
            { key: "B", text: "Stack" },
            { key: "C", text: "Binary Search Tree" },
            { key: "D", text: "Priority Queue" }
          ],
          correctOption: "B",
          explanation: "A Stack follows the Last In First Out (LIFO) order where insertion and removal happen at the top."
        },
        {
          id: 2,
          type: "objective",
          marks: 2,
          question: "What is the average case time complexity of searching for an element in a Hash Table with a uniform hash function?",
          options: [
            { key: "A", text: "O(1)" },
            { key: "B", text: "O(log n)" },
            { key: "C", text: "O(n)" },
            { key: "D", text: "O(n log n)" }
          ],
          correctOption: "A",
          explanation: "With uniform hashing and low load factor, search, insert, and delete operations take O(1) average time."
        },
        {
          id: 3,
          type: "objective",
          marks: 2,
          question: "Which sorting algorithm achieves an optimal best-case time complexity of O(n) when the input array is already sorted?",
          options: [
            { key: "A", text: "Merge Sort" },
            { key: "B", text: "Quick Sort" },
            { key: "C", text: "Insertion Sort" },
            { key: "D", text: "Selection Sort" }
          ],
          correctOption: "C",
          explanation: "Insertion sort requires only a single pass of comparisons O(n) when elements are already in sorted order."
        },
        {
          id: 4,
          type: "objective",
          marks: 2,
          question: "Which greedy algorithm is specifically designed to construct a Minimum Spanning Tree (MST) for a connected weighted graph?",
          options: [
            { key: "A", text: "Dijkstra's Algorithm" },
            { key: "B", text: "Prim's Algorithm" },
            { key: "C", text: "Bellman-Ford Algorithm" },
            { key: "D", text: "Floyd-Warshall Algorithm" }
          ],
          correctOption: "B",
          explanation: "Prim's and Kruskal's algorithms are standard greedy algorithms used to compute Minimum Spanning Trees."
        },
        {
          id: 5,
          type: "descriptive",
          marks: 6,
          question: "Compare an Array and a Singly Linked List with respect to: (a) Memory Allocation, (b) Insertion at the beginning, and (c) Element access by index. Give one real-world scenario where a Linked List is preferred over an Array.",
          maxWords: 250,
          rubric: "Memory allocation: 2 marks; Insertion efficiency: 2 marks; Index access & application: 2 marks.",
          modelAnswerKey: "1. Memory: Arrays allocate contiguous memory at compile/runtime; Linked Lists allocate dynamic non-contiguous nodes linked via pointers.\n2. Insertion at head: O(n) for Array due to shifting elements; O(1) for Linked List by redirecting head pointer.\n3. Index access: O(1) direct random access for Array; O(n) sequential traversal for Linked List.\n4. Real-world scenario: Implementing undo/redo buffers, music playlist queues, or memory caches where constant-time insertions and deletions are frequent."
        },
        {
          id: 6,
          type: "descriptive",
          marks: 6,
          question: "Explain the Divide and Conquer strategy employed in QuickSort. Outline the steps of partitioning an array, and describe the condition under which QuickSort degrades to its worst-case time complexity O(n²).",
          maxWords: 250,
          rubric: "Divide & Conquer explanation: 2 marks; Partitioning logic: 2 marks; Worst-case analysis: 2 marks.",
          modelAnswerKey: "1. Divide: Select pivot and partition array into sub-arrays (< pivot and > pivot). Conquer: Recursively sort left and right partitions. Combine: No explicit combine step needed as elements are sorted in-place.\n2. Partitioning logic: Choose pivot (e.g. last element), use two pointers to place smaller elements left and larger elements right, then place pivot at its correct sorted position.\n3. Worst-case condition: Occurs when pivot selected is always the smallest or largest element (e.g., sorted array with last element as pivot), leading to unbalanced partitions of sizes 0 and n-1, resulting in O(n²) time."
        }
      ]
    },
    {
      id: "EXAM-CS402",
      code: "CS402",
      title: "Database Management Systems",
      department: "Computer Science & Engineering",
      date: "2026-11-25",
      durationMinutes: 20,
      totalMarks: 20,
      passingMarks: 10,
      status: "upcoming",
      instructions: [
        "Answer all questions within the allocated time of 20 minutes.",
        "Contains 3 Objective questions (2 marks each) and 2 Descriptive questions (7 marks each).",
        "Auto-save is enabled to safeguard against unexpected session loss.",
        "Ensure internet connectivity before starting; saved answers sync automatically upon reconnecting."
      ],
      questions: [
        {
          id: 1,
          type: "objective",
          marks: 2,
          question: "Which normal form eliminates partial functional dependency on the primary key?",
          options: [
            { key: "A", text: "First Normal Form (1NF)" },
            { key: "B", text: "Second Normal Form (2NF)" },
            { key: "C", text: "Third Normal Form (3NF)" },
            { key: "D", text: "Boyce-Codd Normal Form (BCNF)" }
          ],
          correctOption: "B",
          explanation: "2NF requires that the relation is in 1NF and no non-prime attribute is partially dependent on any candidate key."
        },
        {
          id: 2,
          type: "objective",
          marks: 2,
          question: "Which ACID property ensures that all operations in a transaction are completed successfully or none are?",
          options: [
            { key: "A", text: "Atomicity" },
            { key: "B", text: "Consistency" },
            { key: "C", text: "Isolation" },
            { key: "D", text: "Durability" }
          ],
          correctOption: "A",
          explanation: "Atomicity guarantees an 'all or nothing' property for database transactions."
        },
        {
          id: 3,
          type: "objective",
          marks: 2,
          question: "Which SQL clause is used to filter records resulting from an aggregate GROUP BY operation?",
          options: [
            { key: "A", text: "WHERE" },
            { key: "B", text: "HAVING" },
            { key: "C", text: "ORDER BY" },
            { key: "D", text: "FILTER" }
          ],
          correctOption: "B",
          explanation: "The HAVING clause filters groups created by the GROUP BY clause, unlike WHERE which filters individual rows."
        },
        {
          id: 4,
          type: "descriptive",
          marks: 7,
          question: "Explain the four ACID properties in DBMS with a concrete banking transaction example (transferring ₹5,000 from Account A to Account B).",
          maxWords: 250,
          rubric: "Definition of ACID: 3 marks; Banking scenario demonstration: 4 marks.",
          modelAnswerKey: "Atomicity: Debit ₹5,000 from A and Credit ₹5,000 to B both execute; if failure occurs midway, rollback happens.\nConsistency: Total money across A and B remains conserved before and after transaction.\nIsolation: Concurrent transactions cannot read intermediate states (e.g. A debited before B credited).\nDurability: Once committed, updates persist permanently even after system crash."
        },
        {
          id: 5,
          type: "descriptive",
          marks: 7,
          question: "Differentiate between Clustered and Non-Clustered Indexes in relational databases. Explain how B+ Tree indexing accelerates query retrieval.",
          maxWords: 250,
          rubric: "Clustered vs Non-Clustered differences: 3.5 marks; B+ tree index mechanism: 3.5 marks.",
          modelAnswerKey: "Clustered Index: Determines physical order of data in the table; only one per table; leaf nodes contain actual data pages.\nNon-Clustered Index: Separate structure with pointers to physical rows; multiple per table.\nB+ Tree mechanism: Balanced search tree where all data rows reside at leaf level linked sequentially for efficient range scans, with logarithmic search depth O(log n)."
        }
      ]
    },
    {
      id: "EXAM-CS403",
      code: "CS403",
      title: "Computer Networks & Security (Sample Evaluated)",
      department: "Computer Science & Engineering",
      date: "2026-11-05",
      durationMinutes: 15,
      totalMarks: 20,
      passingMarks: 10,
      status: "available",
      instructions: [
        "This examination has already been conducted, submitted, and fully evaluated by the examiner.",
        "You can inspect this record to see the published results, marks breakdown, and examiner feedback."
      ],
      questions: [
        {
          id: 1,
          type: "objective",
          marks: 2,
          question: "Which layer of the OSI model is responsible for end-to-end reliable transmission and flow control?",
          options: [
            { key: "A", text: "Network Layer" },
            { key: "B", text: "Transport Layer" },
            { key: "C", text: "Data Link Layer" },
            { key: "D", text: "Session Layer" }
          ],
          correctOption: "B",
          explanation: "Transport Layer (e.g. TCP) provides end-to-end communication, segmentation, flow control, and error recovery."
        },
        {
          id: 2,
          type: "objective",
          marks: 2,
          question: "What is the standard port number used by Secure HTTP (HTTPS)?",
          options: [
            { key: "A", text: "80" },
            { key: "B", text: "443" },
            { key: "C", text: "8080" },
            { key: "D", text: "22" }
          ],
          correctOption: "B",
          explanation: "HTTPS default port is 443, whereas HTTP uses port 80."
        },
        {
          id: 3,
          type: "descriptive",
          marks: 16,
          question: "Explain the TCP Three-Way Handshake connection establishment mechanism with diagrammatic explanation.",
          maxWords: 200,
          rubric: "SYN, SYN-ACK, ACK packet sequence: 10 marks; Sequence numbers and state transitions: 6 marks.",
          modelAnswerKey: "Step 1: Client sends SYN with initial sequence number x.\nStep 2: Server responds with SYN-ACK, acknowledging x+1 and sending its initial sequence number y.\nStep 3: Client replies with ACK acknowledging y+1. Connection established."
        }
      ]
    }
  ],

  sampleSubmissions: [
    {
      submissionId: "SUB-SAMPLE-001",
      examId: "EXAM-CS403",
      studentId: "STU202601",
      studentName: "Priya Sharma",
      studentRoll: "2026-CS-042",
      department: "Computer Science & Engineering",
      submittedAt: "2026-11-05T10:28:45.000Z",
      submissionType: "manual",
      timeTakenMinutes: 14,
      answers: {
        "1": "B",
        "2": "B",
        "3": "The TCP Three-Way Handshake establishes a reliable communication session between client and server: 1. SYN: The client generates an Initial Sequence Number (ISN=x) and sends a SYN packet to the server requesting a connection. 2. SYN-ACK: The server receives the SYN, allocates buffers, responds with SYN packet having ISN=y, and acknowledges with ACK=x+1. 3. ACK: The client receives SYN-ACK and sends final ACK=y+1. Both ends are now in ESTABLISHED state."
      },
      evaluation: {
        evaluated: true,
        evaluatedBy: "Dr. K. Ramanathan",
        evaluatedAt: "2026-11-05T14:10:00.000Z",
        objectiveMarksObtained: 4,
        descriptiveMarksObtained: 14,
        totalMarksObtained: 18,
        totalPossibleMarks: 20,
        percentage: 90,
        passed: true,
        feedback: {
          "3": {
            marks: 14,
            comments: "Excellent and precise explanation of the 3-way handshake process. Correct sequence numbers and state transitions noted."
          }
        },
        generalRemarks: "Outstanding performance! Conceptual clarity is very strong."
      }
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = INITIAL_DATA;
}
