'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { authService, validators, USER_ROLES, ROLE_LABELS } from '../../lib/auth';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    position: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (serverError) {
      setServerError('');
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
    
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validators.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validators.password(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }    if (!validators.required(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (!validators.passwordMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!validators.required(formData.role)) {
      newErrors.role = 'Please select a role';
    }

    if (!validators.required(formData.position)) {
      newErrors.position = 'Position is required';
    }

    if (!validators.required(formData.department)) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        position: formData.position,
        department: formData.department,
      };

      await authService.register(userData);
      setSuccess(true);

      // Redirect to login after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Account Created Successfully!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your account has been created. Redirecting to login...
          </p>
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className={`transition-colors ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className={`transition-colors ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Role
          </Label>
          <Select onValueChange={handleSelectChange} disabled={isLoading}>
            <SelectTrigger className={`transition-colors ${errors.role ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Position
          </Label>
          <Input
            id="position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleChange}
            placeholder="Your job title"
            className={`transition-colors ${errors.position ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
            disabled={isLoading}
          />
          {errors.position && (
            <p className="text-xs text-red-600">{errors.position}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Department
          </Label>
          <Input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            placeholder="Your department"
            className={`transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
            disabled={isLoading}
          />
          {errors.department && (
            <p className="text-xs text-red-600">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`pr-10 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`pr-10 transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-teal-500'}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
