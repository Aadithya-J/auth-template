# Handling Dynamic Content with Translations

This guide explains how to handle dynamic content that needs to be translated in the application.

## Basic Dynamic Content

For simple cases where you have static text with dynamic values:

```jsx
// ❌ Don't do this
<p>Welcome, {userName}!</p>

// ✅ Do this instead
<p>{t('welcome')}, {userName}!</p>
```

## Interpolation of Variables

For text that includes variables:

### Method 1: String Replacement

```jsx
// In translations.js
{
  en: {
    itemCount: "You have {count} items in your cart"
  },
  ta: {
    itemCount: "உங்கள் கூடையில் {count} பொருட்கள் உள்ளன"
  }
}

// In your component
<p>{t('itemCount').replace('{count}', cartItems.length)}</p>
```

### Method 2: For Multiple Replacements

```jsx
// In translations.js
{
  en: {
    greeting: "Hello {name}, you have {count} notifications"
  },
  ta: {
    greeting: "வணக்கம் {name}, உங்களுக்கு {count} அறிவிப்புகள் உள்ளன"
  }
}

// Helper function to replace multiple variables
const replaceVars = (text, vars) => {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    text
  );
};

// In your component
<p>{replaceVars(t('greeting'), { name: userName, count: notifications.length })}</p>
```

## Pluralization

For content that changes based on count:

```jsx
// In translations.js
{
  en: {
    itemCountZero: "No items in your cart",
    itemCountOne: "One item in your cart",
    itemCountMany: "{count} items in your cart"
  },
  ta: {
    itemCountZero: "உங்கள் கூடையில் பொருட்கள் இல்லை",
    itemCountOne: "உங்கள் கூடையில் ஒரு பொருள் உள்ளது",
    itemCountMany: "உங்கள் கூடையில் {count} பொருட்கள் உள்ளன"
  }
}

// In your component
const getItemText = (count) => {
  if (count === 0) return t('itemCountZero');
  if (count === 1) return t('itemCountOne');
  return t('itemCountMany').replace('{count}', count);
};

<p>{getItemText(cartItems.length)}</p>
```

## Complex Formatting

### Date Formatting

```jsx
// In translations.js
{
  en: {
    dateFormat: "MM/DD/YYYY",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{days} days ago"
  },
  ta: {
    dateFormat: "DD/MM/YYYY",
    today: "இன்று",
    yesterday: "நேற்று",
    daysAgo: "{days} நாட்களுக்கு முன்பு"
  }
}

// In your component
const formatRelativeDate = (date) => {
  const today = new Date();
  const diffTime = Math.abs(today - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('yesterday');
  return t('daysAgo').replace('{days}', diffDays);
};

<span>{formatRelativeDate(commentDate)}</span>
```

### Number Formatting

```jsx
// In translations.js
{
  en: {
    currencySymbol: "$",
    currencyFormat: "{symbol}{amount}"
  },
  ta: {
    currencySymbol: "₹",
    currencyFormat: "{symbol} {amount}"
  }
}

// In your component
const formatCurrency = (amount) => {
  const symbol = t('currencySymbol');
  const formattedAmount = amount.toFixed(2);
  return t('currencyFormat')
    .replace('{symbol}', symbol)
    .replace('{amount}', formattedAmount);
};

<span>{formatCurrency(product.price)}</span>
```

## Dynamic Lists

For translating lists of items:

```jsx
// In translations.js
{
  en: {
    listHeader: "Available options:",
    noOptions: "No options available"
  },
  ta: {
    listHeader: "கிடைக்கும் விருப்பங்கள்:",
    noOptions: "விருப்பங்கள் எதுவும் கிடைக்கவில்லை"
  }
}

// In your component
<div>
  <h3>{t('listHeader')}</h3>
  {options.length > 0 ? (
    <ul>
      {options.map(option => (
        <li key={option.id}>
          {/* If option names need translation, store them in translations */}
          {t(`option.${option.id}`)}
        </li>
      ))}
    </ul>
  ) : (
    <p>{t('noOptions')}</p>
  )}
</div>
```

## Error Messages

For dynamic error messages:

```jsx
// In translations.js
{
  en: {
    error: "An error occurred: {message}",
    networkError: "Network error: Could not connect to server",
    validationError: "Please fix the following error: {field} {message}"
  },
  ta: {
    error: "பிழை ஏற்பட்டது: {message}",
    networkError: "நெட்வொர்க் பிழை: சர்வருடன் இணைக்க முடியவில்லை",
    validationError: "பின்வரும் பிழையை சரிசெய்யவும்: {field} {message}"
  }
}

// In your component
const renderError = (error) => {
  if (error.type === 'network') {
    return t('networkError');
  }
  
  if (error.type === 'validation') {
    return t('validationError')
      .replace('{field}', t(`field.${error.field}`))
      .replace('{message}', t(`validation.${error.code}`));
  }
  
  // Default case
  return t('error').replace('{message}', error.message);
};

{error && <div className="error-message">{renderError(error)}</div>}
```

## Best Practices

1. Never concatenate strings with `+` for translation, use replacement patterns
2. Keep the same variable names in both English and Tamil translations
3. Consider word order differences between languages when designing templates
4. Test thoroughly with both languages to ensure all dynamic content displays correctly
5. For complex cases, create specific helper functions for formatting
6. When possible, translate the entire phrase rather than individual words
7. Remember that Tamil may require more character space than English

## Helper Functions

We recommend using these helper functions for common translation patterns:

```jsx
// src/utils/translationHelpers.js

// Replace variables in a translation string
export const replaceVars = (text, variables) => {
  if (!text) return '';
  
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    text
  );
};

// Handle pluralization
export const pluralize = (count, keys) => {
  const { zero, one, many } = keys;
  
  if (count === 0 && zero) return t(zero);
  if (count === 1 && one) return t(one);
  return replaceVars(t(many), { count });
};

// Example usage:
// pluralize(items.length, { 
//   zero: 'itemCountZero', 
//   one: 'itemCountOne', 
//   many: 'itemCountMany' 
// });
``` 