import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon = null,
  step,
  min,
  max,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--navy-400)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={`form-input ${error ? 'is-invalid' : ''} ${className}`}
          style={{
            paddingLeft: icon ? '38px' : '14px',
          }}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default Input;
