import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider, LanguageContext } from './context/LanguageContext';

const TranslationConsumer = () => {
  const { t, lang, changeLanguage } = useContext(LanguageContext);

  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="text">{t('Привіт')}</span>
      <button onClick={() => changeLanguage('en')}>switch</button>
    </div>
  );
};

test('translates unknown strings through fallback API when language is switched to English', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: 'Hello' },
        matches: [{ translation: 'Hello' }]
      })
    })
  );

  render(
    <LanguageProvider>
      <TranslationConsumer />
    </LanguageProvider>
  );

  const button = screen.getByRole('button', { name: /switch/i });
  button.click();

  await waitFor(() => {
    expect(screen.getByTestId('text').textContent).toBe('Hello');
  }, { timeout: 3000 });
});

test('includes auth strings in the default language dictionary', () => {
  const { getByTestId } = render(
    <LanguageProvider>
      <TranslationConsumer />
    </LanguageProvider>
  );

  expect(getByTestId('text').textContent).toBe('Привіт');
  expect(screen.getByText('Увійти')).toBeInTheDocument();
});
