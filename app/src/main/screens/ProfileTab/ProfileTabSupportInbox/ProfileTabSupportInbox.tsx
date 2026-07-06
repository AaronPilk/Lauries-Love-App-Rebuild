import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

// types
import { RootProfileTabParamList } from 'main/navigators/ProfileTabStacks/ProfileTabStacks.types';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';

// constants
import { PATHS_PROFILE_TAB } from 'main/navigators/paths';

// backend
import {
  getIsSupportOwner,
  getSupportTickets,
  SupportTicket,
} from 'services/supabase/supabase.support';

// styles
import styles from './ProfileTabSupportInbox.styles';
import colors from 'styles/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootProfileTabParamList>;
};

type Filter = 'all' | 'open' | 'in_progress' | 'closed';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'closed', label: 'Closed' },
];
const STATUS_LABEL: Record<SupportTicket['status'], string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};
const badgeStyle = (s: SupportTicket['status']) =>
  s === 'open' ? styles.bopen : s === 'in_progress' ? styles.binprogress : styles.bclosed;
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ProfileTabSupportInbox: FunctionComponent<Props> = ({ navigation }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [isOwner, setIsOwner] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [t, owner] = await Promise.all([
        getSupportTickets(),
        getIsSupportOwner(),
      ]);
      setTickets(t);
      setIsOwner(owner);
    } catch (e) {
      if (__DEV__) console.warn('load tickets failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch on focus so triage changes from the detail screen show up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const counts = useMemo(() => {
    const c = { open: 0, in_progress: 0, closed: 0 };
    tickets.forEach(t => (c[t.status] += 1));
    return c;
  }, [tickets]);

  const visible = useMemo(
    () => (filter === 'all' ? tickets : tickets.filter(t => t.status === filter)),
    [tickets, filter],
  );

  const renderItem = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(PATHS_PROFILE_TAB.profileTabSupportTicket, {
          ticketId: item.id,
        })
      }
    >
      <View style={styles.cardTop}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={[styles.badge, badgeStyle(item.status)]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
      <Text style={styles.meta}>
        {item.category} · {item.reporterName} · {fmt(item.createdAt)}
        {item.assigneeName ? ` · → ${item.assigneeName}` : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BackgroundScreen>
      <HeaderTabScreen
        title="Support inbox"
        onPressLeft={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {isOwner && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(PATHS_PROFILE_TAB.profileTabSupportStaff)
            }
          >
            <Text style={styles.manageLink}>Manage agents ›</Text>
          </TouchableOpacity>
        )}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statN}>{counts.open}</Text>
            <Text style={styles.statL}>Open</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statN}>{counts.in_progress}</Text>
            <Text style={styles.statL}>In prog</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statN}>{counts.closed}</Text>
            <Text style={styles.statL}>Closed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statN}>{tickets.length}</Text>
            <Text style={styles.statL}>Total</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary[500]} />
        ) : visible.length === 0 ? (
          <Text style={styles.empty}>No tickets here.</Text>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={t => t.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>
    </BackgroundScreen>
  );
};

export default ProfileTabSupportInbox;
