import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('servants', './routes/servants-index.tsx'),
  route('servants/:collectionNo', './routes/servant-detail.tsx'),
  route('materials', './routes/materials-index.tsx'),
  route('materials/:itemId', './routes/material-detail.tsx'),
  route('class-score', './routes/class-score-index.tsx'),
  route('class-score/:boardId', './routes/class-score-detail.tsx'),
  route('guide/usage', './routes/usage-guide.tsx'),
  route('updates', './routes/updates.tsx'),
] satisfies RouteConfig;
