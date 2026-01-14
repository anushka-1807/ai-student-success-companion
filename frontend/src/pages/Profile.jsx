import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Award, BookOpen, Calculator, FileText, Edit2, Save, X } from 'lucide-react';
import Button from '../components/Button';
import { useStats } from '../hooks/useStats';

const Profile = () => {
  const { user } = useAuth();
  const { stats } = useStats();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    university: '',
    major: '',
    graduationYear: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setProfileData(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }

    // Update user data when user changes
    if (user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSave = () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setIsEditing(false);
      // Force a re-render to show updated data
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({ 
          ...prev, 
          ...parsed,
          displayName: user?.displayName || parsed.displayName || '',
          email: user?.email || parsed.email || ''
        }));
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    }
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profileData.displayName || 'Student'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                  <Mail className="w-4 h-4 mr-2" />
                  {profileData.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Resumes Analyzed</p>
                  <p className="text-3xl font-bold">{stats.resumesAnalyzed}</p>
                </div>
                <FileText className="w-8 h-8 text-green-100" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Notes Generated</p>
                  <p className="text-3xl font-bold">{stats.notesGenerated}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-100" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">SGPA Calculations</p>
                  <p className="text-3xl font-bold">{stats.sgpaCalculations}</p>
                </div>
                <Calculator className="w-8 h-8 text-orange-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {profileData.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.university}
                  onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Your university"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {profileData.university || 'Not specified'}
                </p>
              )}
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.major}
                  onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Your major"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {profileData.major || 'Not specified'}
                </p>
              )}
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Graduation Year
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={profileData.graduationYear}
                  onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="2024"
                  min="2020"
                  max="2030"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {profileData.graduationYear || 'Not specified'}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              {isEditing && (
                <div className="flex mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill"
                  />
                  <Button
                    onClick={addSkill}
                    className="rounded-l-none bg-blue-500 hover:bg-blue-600"
                  >
                    Add
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {profileData.skills.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
