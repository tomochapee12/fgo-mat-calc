import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { UserStateProvider } from '@/contexts/UserStateContext';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import { servants } from '@/data/loader';
import { useFilteredServants } from '@/hooks/useFilteredServants';
import { Layout } from '@/components/layout/Layout';
import { Navigation, type TabId } from '@/components/layout/Navigation';
import { ServantFilter } from '@/components/servant/ServantFilter';
import { ServantList } from '@/components/servant/ServantList';
import { ServantDetail } from '@/components/servant/ServantDetail';
import { MaterialSummary } from '@/components/calculator/MaterialSummary';
import { ClassScoreDashboard } from '@/components/class-score/ClassScoreDashboard';
import { InventoryEditor } from '@/components/inventory/InventoryEditor';
import { PlanningDashboard } from '@/components/planning/PlanningDashboard';
import { DataTransfer } from '@/components/data-transfer/DataTransfer';
import { servantMap } from '@/data/loader';
import { SeoAbout } from '@/components/seo/SeoAbout';
import { trackEvent } from '@/utils/analytics';

function AppContent() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabId>('servants');
  const [selectedServantNo, setSelectedServantNo] = useState<number | null>(null);
  const { state, dispatch } = useUserStateContext();
  const { filtered, filters, setFilters } = useFilteredServants(servants);

  const configuredIds = useMemo(
    () => new Set(Object.keys(state.servants).map(Number)),
    [state.servants]
  );
  const ownedIds = useMemo(
    () =>
      new Set(
        Object.entries(state.roster)
          .filter(([, roster]) => roster.owned)
          .map(([collectionNo]) => Number(collectionNo))
      ),
    [state.roster]
  );
  const priorities = useMemo(
    () =>
      new Map(
        Object.entries(state.roster)
          .map(([collectionNo, roster]) => [Number(collectionNo), roster.priority] as const)
          .filter(([, priority]) => priority > 0)
      ),
    [state.roster]
  );

  const selectedServant = selectedServantNo
    ? servantMap.get(selectedServantNo) ?? null
    : null;

  useEffect(() => {
    const requestedServant = Number(searchParams.get('servant'));
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && Number.isInteger(requestedServant) && servantMap.has(requestedServant)) {
        setTab('servants');
        setSelectedServantNo(requestedServant);
      }
    });
    return () => { cancelled = true; };
  }, [searchParams]);

  const showServantList = () => {
    setTab('servants');
    setSelectedServantNo(null);
  };

  const selectServant = (collectionNo: number) => {
    setSelectedServantNo(collectionNo);
    trackEvent('select_servant', { collection_no: collectionNo });
  };

  const changeTab = (nextTab: TabId) => {
    setTab(nextTab);
    setSelectedServantNo(null);
    trackEvent('change_tab', { tab: nextTab });
  };

  const resetAllSettings = () => {
    if (!window.confirm('全サーヴァントの育成設定をリセットします。よろしいですか？')) {
      return;
    }
    dispatch({ type: 'RESET_ALL' });
    showServantList();
  };

  return (
    <Layout onHome={showServantList} onResetAll={resetAllSettings}>
      <Navigation tab={tab} onTabChange={changeTab} />

      {tab === 'servants' && !selectedServant && (
        <>
          <ServantFilter filters={filters} onChange={setFilters} />
          <ServantList
            servants={filtered}
            configuredIds={configuredIds}
            ownedIds={ownedIds}
            priorities={priorities}
            onSelect={selectServant}
          />
        </>
      )}

      {tab === 'servants' && selectedServant && (
        <ServantDetail
          servant={selectedServant}
          onBack={() => setSelectedServantNo(null)}
        />
      )}

      {tab === 'calculator' && <MaterialSummary />}

      {tab === 'inventory' && <InventoryEditor />}

      {tab === 'planning' && <PlanningDashboard />}

      {tab === 'class-score' && <ClassScoreDashboard />}

      {tab === 'data-transfer' && <DataTransfer />}

      <SeoAbout />
    </Layout>
  );
}

function App() {
  return (
    <UserStateProvider>
      <AppContent />
    </UserStateProvider>
  );
}

export default App;
