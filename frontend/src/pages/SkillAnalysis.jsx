import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Briefcase, BookOpen, Star, Plus, Search, Filter } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const SkillAnalysis = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [careerGoals, setCareerGoals] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [industryTrends, setIndustryTrends] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner', category: 'technical' });
  const [newCareer, setNewCareer] = useState({ title: '', industry: '', priority: 'high' });
  const [selectedIndustry, setSelectedIndustry] = useState('technology');

  // Mock industry trends data
  const mockTrends = {
    technology: [
      { skill: 'Artificial Intelligence', demand: 95, growth: '+45%', salary: '$120k-180k' },
      { skill: 'Cloud Computing', demand: 90, growth: '+38%', salary: '$100k-160k' },
      { skill: 'Cybersecurity', demand: 88, growth: '+35%', salary: '$95k-150k' },
      { skill: 'Data Science', demand: 85, growth: '+32%', salary: '$110k-170k' },
      { skill: 'DevOps', demand: 82, growth: '+28%', salary: '$105k-155k' },
      { skill: 'React/Frontend', demand: 80, growth: '+25%', salary: '$85k-140k' }
    ],
    healthcare: [
      { skill: 'Telemedicine', demand: 92, growth: '+42%', salary: '$80k-130k' },
      { skill: 'Health Informatics', demand: 88, growth: '+35%', salary: '$75k-120k' },
      { skill: 'Mental Health', demand: 85, growth: '+30%', salary: '$70k-110k' },
      { skill: 'Geriatric Care', demand: 83, growth: '+28%', salary: '$65k-100k' }
    ],
    finance: [
      { skill: 'Fintech', demand: 90, growth: '+40%', salary: '$100k-170k' },
      { skill: 'Blockchain', demand: 85, growth: '+35%', salary: '$110k-180k' },
      { skill: 'Risk Management', demand: 80, growth: '+25%', salary: '$90k-140k' },
      { skill: 'ESG Investing', demand: 78, growth: '+22%', salary: '$95k-150k' }
    ],
    marketing: [
      { skill: 'Digital Marketing', demand: 88, growth: '+38%', salary: '$60k-120k' },
      { skill: 'Content Strategy', demand: 85, growth: '+32%', salary: '$55k-100k' },
      { skill: 'SEO/SEM', demand: 82, growth: '+28%', salary: '$50k-95k' },
      { skill: 'Social Media', demand: 80, growth: '+25%', salary: '$45k-85k' }
    ]
  };

  // Career skill requirements
  const careerSkillMap = {
    'Software Engineer': ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'Algorithms'],
    'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Tableau', 'R'],
    'Product Manager': ['Analytics', 'User Research', 'Agile', 'Strategy', 'Communication'],
    'UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Psychology'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Monitoring'],
    'Cybersecurity Analyst': ['Network Security', 'Penetration Testing', 'SIEM', 'Compliance']
  };

  useEffect(() => {
    // Load data from localStorage
    const savedSkills = localStorage.getItem('userSkills');
    const savedCareers = localStorage.getItem('careerGoals');
    
    if (savedSkills) setUserSkills(JSON.parse(savedSkills));
    if (savedCareers) setCareerGoals(JSON.parse(savedCareers));
    
    // Set initial industry trends
    setIndustryTrends(mockTrends[selectedIndustry] || []);
  }, [selectedIndustry]);

  // Calculate skill gaps
  useEffect(() => {
    const gaps = [];
    careerGoals.forEach(career => {
      const requiredSkills = careerSkillMap[career.title] || [];
      const userSkillNames = userSkills.map(s => s.name.toLowerCase());
      
      requiredSkills.forEach(skill => {
        if (!userSkillNames.includes(skill.toLowerCase())) {
          gaps.push({
            skill,
            career: career.title,
            priority: career.priority,
            category: 'missing'
          });
        }
      });
    });
    setSkillGaps(gaps);
  }, [userSkills, careerGoals]);

  const addSkill = () => {
    const skill = {
      ...newSkill,
      id: Date.now(),
      dateAdded: new Date().toISOString()
    };
    const updatedSkills = [...userSkills, skill];
    setUserSkills(updatedSkills);
    localStorage.setItem('userSkills', JSON.stringify(updatedSkills));
    setNewSkill({ name: '', level: 'beginner', category: 'technical' });
    setShowAddSkill(false);
  };

  const addCareerGoal = () => {
    const career = {
      ...newCareer,
      id: Date.now(),
      dateAdded: new Date().toISOString()
    };
    const updatedCareers = [...careerGoals, career];
    setCareerGoals(updatedCareers);
    localStorage.setItem('careerGoals', JSON.stringify(updatedCareers));
    setNewCareer({ title: '', industry: '', priority: 'high' });
    setShowAddCareer(false);
  };

  const getSkillLevelColor = (level) => {
    const colors = {
      beginner: 'bg-red-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-blue-500',
      expert: 'bg-green-500'
    };
    return colors[level] || colors.beginner;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500'
    };
    return colors[priority] || colors.medium;
  };

  const getDemandColor = (demand) => {
    if (demand >= 90) return 'text-green-500';
    if (demand >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Simple line chart for industry skill demand using SVG (no extra libraries)
  const IndustryDemandChart = ({ trends }) => {
    if (!trends || !trends.length) {
      return (
        <div className="h-24 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
          Add an industry to see demand trends.
        </div>
      );
    }

    const values = trends.map((t) => t.demand);
    const max = Math.max(...values, 100);
    const min = Math.min(...values, 0);
    const paddingX = 10;
    const paddingY = 8;
    const width = 260;
    const height = 80;
    const stepX =
      trends.length > 1 ? (width - paddingX * 2) / (trends.length - 1) : 0;

    const toY = (v) => {
      const ratio = max === min ? 0.5 : (v - min) / (max - min || 1);
      return height - paddingY - ratio * (height - paddingY * 2);
    };

    const pathD = trends
      .map((t, i) => {
        const x = paddingX + i * stepX;
        const y = toY(t.demand);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Demand over top skills
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Higher bar = higher demand
          </p>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-20 text-primary-500 dark:text-primary-400"
        >
          <defs>
            <linearGradient id="industryDemandLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#industryDemandLine)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {trends.map((t, i) => {
            const x = paddingX + i * stepX;
            const y = toY(t.demand);
            return (
              <g key={t.skill}>
                <circle
                  cx={x}
                  cy={y}
                  r={3.5}
                  className="fill-white dark:fill-gray-900 stroke-secondary-400 dark:stroke-secondary-300"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Floating background elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        {/* Header */}
        <Card variant="gradient" className="p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Skill Gap Analysis & Industry Trends
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Identify skills needed for your target careers and stay updated with industry trends
              </p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Career Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Skills */}
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  My Skills
                </h2>
                <Button onClick={() => setShowAddSkill(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              {showAddSkill && (
                <Card variant="glass" className="p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="technical">Technical</option>
                      <option value="soft">Soft Skills</option>
                      <option value="language">Language</option>
                      <option value="certification">Certification</option>
                    </select>
                    <div className="flex gap-2">
                      <Button onClick={addSkill} size="sm">Add</Button>
                      <Button variant="outline" onClick={() => setShowAddSkill(false)} size="sm">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userSkills.map((skill) => (
                  <Card key={skill.id} variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(skill.level)}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {skill.level} • {skill.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Career Goals */}
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  Career Goals
                </h2>
                <Button onClick={() => setShowAddCareer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>

              {showAddCareer && (
                <Card variant="glass" className="p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newCareer.title}
                      onChange={(e) => setNewCareer({...newCareer, title: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Career</option>
                      {Object.keys(careerSkillMap).map(career => (
                        <option key={career} value={career}>{career}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Industry"
                      value={newCareer.industry}
                      onChange={(e) => setNewCareer({...newCareer, industry: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newCareer.priority}
                      onChange={(e) => setNewCareer({...newCareer, priority: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <div className="flex gap-2">
                      <Button onClick={addCareerGoal} size="sm">Add</Button>
                      <Button variant="outline" onClick={() => setShowAddCareer(false)} size="sm">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                {careerGoals.map((career) => (
                  <Card key={career.id} variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(career.priority)}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{career.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {career.industry} • {career.priority} priority
                          </p>
                        </div>
                      </div>
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Skill Gaps */}
            {skillGaps.length > 0 && (
              <Card variant="floating" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <Award className="h-6 w-6 text-orange-500" />
                  Skill Gaps Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillGaps.map((gap, index) => (
                    <Card key={index} variant="glass" className="p-4 border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{gap.skill}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Required for: {gap.career}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(gap.priority)}`}>
                          {gap.priority}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Industry Trends */}
          <div className="space-y-6">
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Industry Trends
                </h2>
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setIndustryTrends(mockTrends[e.target.value] || []);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              {/* High-level demand chart */}
              <IndustryDemandChart trends={industryTrends} />

              <div className="space-y-4">
                {industryTrends.map((trend, index) => (
                  <Card key={index} variant="glass" className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{trend.skill}</h3>
                        <span className={`font-bold text-sm ${getDemandColor(trend.demand)}`}>
                          {trend.demand}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400 font-medium">{trend.growth}</span>
                        <span>{trend.salary}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${trend.demand}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card variant="floating" className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Quick Stats
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userSkills.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Skills</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {skillGaps.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Skill Gaps</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Skill Distribution</h3>
                  {['technical', 'soft', 'language', 'certification'].map((category) => {
                    const count = userSkills.filter(s => s.category === category).length;
                    const percentage = userSkills.length > 0 ? (count / userSkills.length) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
