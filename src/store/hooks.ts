import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from './index';
import type { RootState } from './rootReducer';

/** Typed wrappers so components never annotate dispatch or state by hand. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
