export interface Article {
  id: string;
  title: string;
  date: string;
}

export const articles: Article[] = [
  {
    id: 'trying-to-be-human',
    title: 'Trying to Be Human',
    date: '07.Dec.2025'
  },
  {
    id: 'buy-a-domain',
    title: 'Buy a Domain',
    date: '02.Dec.2025'
  },
  {
    id: 'stop-fictional-case-studies',
    title: 'Stop Writing Fictional Case Studies',
    date: '26.Nov.2025'
  },
  {
    id: 'design-is-the-moat',
    title: 'Design Is The Moat',
    date: '15.Nov.2025'
  },
  {
    id: 'growth-without-hacks',
    title: 'Growth Without Hacks',
    date: '05.Nov.2025'
  },
  {
    id: 'make-something-you-want',
    title: 'Make Something You Want',
    date: '01.Nov.2025'
  }
];

// Sort articles by date (newest first)
export const sortedArticles = [...articles].sort((a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateB.getTime() - dateA.getTime();
});
