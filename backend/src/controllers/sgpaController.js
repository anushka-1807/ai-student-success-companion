const admin = require('firebase-admin');

const sgpaController = {
  /**
   * Calculate SGPA from marks and credits
   */
  async calculateSGPA(req, res) {
    try {
      const { subjects } = req.body;
      const userId = req.user.uid;

      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide an array of subjects with marks and credits',
        });
      }

      // Validate and calculate
      const breakdown = [];
      let totalCredits = 0;
      let weightedSum = 0;

      for (const subject of subjects) {
        const { name, marks, credits } = subject;

        if (typeof marks !== 'number' || typeof credits !== 'number') {
          return res.status(400).json({
            success: false,
            error: `Invalid marks or credits for subject: ${name || 'Unknown'}`,
          });
        }

        if (marks < 0 || marks > 100) {
          return res.status(400).json({
            success: false,
            error: `Marks must be between 0 and 100 for subject: ${name || 'Unknown'}`,
          });
        }

        if (credits <= 0) {
          return res.status(400).json({
            success: false,
            error: `Credits must be positive for subject: ${name || 'Unknown'}`,
          });
        }

        const gradePoint = sgpaController.getGradePoint(marks);
        const grade = sgpaController.getGrade(marks);
        const creditPoints = credits * gradePoint;

        breakdown.push({
          name: name || `Subject ${breakdown.length + 1}`,
          marks,
          credits,
          grade,
          gradePoint,
          creditPoints,
        });

        totalCredits += credits;
        weightedSum += creditPoints;
      }

      const sgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;

      const result = {
        sgpa: parseFloat(sgpa),
        totalCredits,
        weightedSum: parseFloat(weightedSum.toFixed(2)),
        breakdown,
        formula: 'SGPA = Σ(Ci × Gi) / Σ(Ci)',
      };

      // Store in Firestore
      const db = admin.firestore();
      await db
        .collection('users')
        .doc(userId)
        .collection('sgpa_history')
        .add({
          ...result,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Calculate SGPA error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Get grade point from marks
   * @param {number} marks - Marks obtained
   * @returns {number} Grade point
   */
  getGradePoint(marks) {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 45) return 5;
    if (marks >= 40) return 4;
    return 0;
  },

  /**
   * Get letter grade from marks
   * @param {number} marks - Marks obtained
   * @returns {string} Letter grade
   */
  getGrade(marks) {
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 50) return 'B';
    if (marks >= 45) return 'C';
    if (marks >= 40) return 'P';
    return 'F';
  },
};

module.exports = sgpaController;
