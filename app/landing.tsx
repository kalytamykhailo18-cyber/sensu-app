import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: _W, height: H } = Dimensions.get('window');
const W = Platform.OS === 'web' ? Math.min(_W, 480) : _W;

const SPRING  = { damping: 18, stiffness: 200 };
const EASE    = { duration: 420, easing: Easing.out(Easing.cubic) };

// ── Brand palette ─────────────────────────────────────────────────────────────
const BRAND = {
  primary:   '#3D2314',
  orange:    '#E87A2F',
  cream:     '#FAF6F1',
  creamDark: '#F5EDE4',
  border:    '#E0D5CA',
  text:      '#2C1A0E',
  muted:     '#6B5545',
  light:     '#A89485',
  error:     '#D94444',
  success:   '#44AA44',
  heroBg:    '#1A120C',
};

// ── Images ────────────────────────────────────────────────────────────────────
const IMG = {
  hero:    require('../assets/images/landing/hero.jpg'),
  watch:   require('../assets/images/landing/watch.jpg'),
  family:  require('../assets/images/landing/family.jpg'),
  elderly: require('../assets/images/landing/elderly.jpg'),
  step1:   require('../assets/images/landing/step1.jpg'),
  step2:   require('../assets/images/landing/step2.jpg'),
  step3:   require('../assets/images/landing/step3.jpg'),
  av1:     require('../assets/images/landing/av1.jpg'),
  av2:     require('../assets/images/landing/av2.jpg'),
  av3:     require('../assets/images/landing/av3.jpg'),
};

// ── FAQ accordion item ─────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const maxH    = useSharedValue(0);
  const chevron = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: maxH.value,
    overflow: 'hidden',
    opacity: interpolate(maxH.value, [0, 40], [0, 1], 'clamp'),
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chevron.value, [0, 1], [0, 180])}deg` }],
  }));

  const toggle = () => {
    const opening = !open;
    maxH.value    = withSpring(opening ? 200 : 0, { damping: 16, stiffness: 160 });
    chevron.value = withTiming(opening ? 1 : 0, { duration: 280 });
    setOpen(v => !v);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  return (
    <Pressable onPress={toggle} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{q}</Text>
        <Animated.View style={chevronStyle}>
          <IconSymbol name="chevron.down" size={18} color={BRAND.muted} />
        </Animated.View>
      </View>
      <Animated.View style={bodyStyle}>
        <Text style={styles.faqA}>{a}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay, scrollY, cardY }: {
  icon: string; title: string; desc: string;
  delay: number;
  scrollY: SharedValue<number>;
  cardY: SharedValue<number>;
}) {
  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => {
    const t  = cardY.value - H * 0.82;
    const op = interpolate(scrollY.value, [t, t + 180], [0, 1], 'clamp');
    const ty = interpolate(scrollY.value, [t, t + 180], [50, 0], 'clamp');
    const sc = interpolate(scrollY.value, [t, t + 180], [0.94, 1], 'clamp');
    return { opacity: op, transform: [{ translateY: ty }, { scale: sc * scale.value }] };
  });

  return (
    <Animated.View style={[styles.featureCard, cardStyle]}>
      <Pressable
        onPressIn={() =>  { scale.value = withSpring(0.95, SPRING); }}
        onPressOut={() => { scale.value = withSpring(1.00, SPRING); }}
        style={styles.featureInner}
      >
        <View style={styles.featureIconWrap}>
          <IconSymbol name={icon as any} size={28} color={BRAND.orange} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Testimonial card ───────────────────────────────────────────────────────────
function TestimonialCard({ avatar, name, role, quote }: {
  avatar: any; name: string; role: string; quote: string;
}) {
  return (
    <View style={styles.testimonialCard}>
      <View style={styles.stars}>
        {[0,1,2,3,4].map(i => (
          <IconSymbol key={i} name="star.fill" size={14} color={BRAND.orange} />
        ))}
      </View>
      <Text style={styles.testimonialQuote}>"{quote}"</Text>
      <View style={styles.testimonialAuthor}>
        <Image source={avatar} style={styles.testimonialAvatar} />
        <View>
          <Text style={styles.testimonialName}>{name}</Text>
          <Text style={styles.testimonialRole}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main landing screen ────────────────────────────────────────────────────────
export default function LandingScreen() {
  const isDark = useColorScheme() === 'dark';

  // ── Scroll ──────────────────────────────────────────────────────────────────
  const scrollY  = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  // ── Section Y positions ──────────────────────────────────────────────────────
  const statsY         = useSharedValue(9999);
  const featuresY      = useSharedValue(9999);
  const featureCard0Y  = useSharedValue(9999);
  const featureCard1Y  = useSharedValue(9999);
  const featureCard2Y  = useSharedValue(9999);
  const featureCard3Y  = useSharedValue(9999);
  const howY           = useSharedValue(9999);
  const deviceY        = useSharedValue(9999);
  const familyY        = useSharedValue(9999);
  const testimonialsY  = useSharedValue(9999);
  const whyY           = useSharedValue(9999);
  const faqY           = useSharedValue(9999);
  const ctaY           = useSharedValue(9999);

  // ── Hero entrance ────────────────────────────────────────────────────────────
  const heroLogoOp  = useSharedValue(0);
  const heroLogoS   = useSharedValue(0.6);
  const heroWordOp  = useSharedValue(0);
  const heroWordY   = useSharedValue(28);
  const heroTagOp   = useSharedValue(0);
  const heroTagY    = useSharedValue(22);
  const heroSubOp   = useSharedValue(0);
  const heroSubY    = useSharedValue(16);
  const heroCTAOp   = useSharedValue(0);
  const heroCTAY    = useSharedValue(20);
  const bounce      = useSharedValue(0);

  // ── CTA press scale ──────────────────────────────────────────────────────────
  const ps1 = useSharedValue(1);
  const ps2 = useSharedValue(1);
  const ps3 = useSharedValue(1);

  // ── Hero parallax ────────────────────────────────────────────────────────────
  const heroImgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.38 }],
  }));

  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, onLayout Y positions never fire correctly inside Animated.ScrollView.
      // Setting Y=0 makes t = 0 - H*0.82 (negative), so interpolate clamps to opacity=1 immediately.
      [statsY, featuresY, featureCard0Y, featureCard1Y, featureCard2Y, featureCard3Y,
       howY, deviceY, familyY, testimonialsY, whyY, faqY, ctaY].forEach(v => { v.value = 0; });
    }
  }, []);

  useEffect(() => {
    heroLogoOp.value  = withDelay(200, withTiming(1, { duration: 700 }));
    heroLogoS.value   = withDelay(200, withSpring(1, SPRING));
    heroWordOp.value  = withDelay(550, withTiming(1, EASE));
    heroWordY.value   = withDelay(550, withTiming(0, EASE));
    heroTagOp.value   = withDelay(750, withTiming(1, EASE));
    heroTagY.value    = withDelay(750, withTiming(0, EASE));
    heroSubOp.value   = withDelay(920, withTiming(1, EASE));
    heroSubY.value    = withDelay(920, withTiming(0, EASE));
    heroCTAOp.value   = withDelay(1100, withTiming(1, EASE));
    heroCTAY.value    = withDelay(1100, withTiming(0, EASE));
    bounce.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 750 }),
        withTiming(0,  { duration: 750 })
      ), -1, false
    );
  }, []);

  // ── Section animated styles (scroll-triggered) ────────────────────────────────
  const statsStyle = useAnimatedStyle(() => {
    const t = statsY.value - H * 0.82;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 200], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 200], [40, 0], 'clamp') }],
    };
  });
  const featuresHeaderStyle = useAnimatedStyle(() => {
    const t = featuresY.value - H * 0.85;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 180], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 180], [30, 0], 'clamp') }],
    };
  });
  const howStyle = useAnimatedStyle(() => {
    const t = howY.value - H * 0.8;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 220], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 220], [40, 0], 'clamp') }],
    };
  });
  const deviceStyle = useAnimatedStyle(() => {
    const t = deviceY.value - H * 0.78;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 250], [0, 1], 'clamp'),
      transform: [{ scale: interpolate(scrollY.value, [t, t + 250], [0.95, 1], 'clamp') }],
    };
  });
  const familyStyle = useAnimatedStyle(() => {
    const t = familyY.value - H * 0.8;
    return { opacity: interpolate(scrollY.value, [t, t + 200], [0, 1], 'clamp') };
  });
  const testimonialsStyle = useAnimatedStyle(() => {
    const t = testimonialsY.value - H * 0.85;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 180], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 180], [30, 0], 'clamp') }],
    };
  });
  const whyStyle = useAnimatedStyle(() => {
    const t = whyY.value - H * 0.82;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 200], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 200], [40, 0], 'clamp') }],
    };
  });
  const faqStyle = useAnimatedStyle(() => {
    const t = faqY.value - H * 0.85;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 180], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 180], [30, 0], 'clamp') }],
    };
  });
  const ctaStyle = useAnimatedStyle(() => {
    const t = ctaY.value - H * 0.8;
    return {
      opacity:   interpolate(scrollY.value, [t, t + 220], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scrollY.value, [t, t + 220], [40, 0], 'clamp') }],
    };
  });

  // Hero animated element styles
  const heroLogoStyle = useAnimatedStyle(() => ({
    opacity: heroLogoOp.value, transform: [{ scale: heroLogoS.value }],
  }));
  const heroWordStyle = useAnimatedStyle(() => ({
    opacity: heroWordOp.value, transform: [{ translateY: heroWordY.value }],
  }));
  const heroTagStyle = useAnimatedStyle(() => ({
    opacity: heroTagOp.value, transform: [{ translateY: heroTagY.value }],
  }));
  const heroSubStyle = useAnimatedStyle(() => ({
    opacity: heroSubOp.value, transform: [{ translateY: heroSubY.value }],
  }));
  const heroCTAStyle = useAnimatedStyle(() => ({
    opacity: heroCTAOp.value, transform: [{ translateY: heroCTAY.value }],
  }));
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const btn1Style = useAnimatedStyle(() => ({ transform: [{ scale: ps1.value }] }));
  const btn2Style = useAnimatedStyle(() => ({ transform: [{ scale: ps2.value }] }));
  const btn3Style = useAnimatedStyle(() => ({ transform: [{ scale: ps3.value }] }));

  const onCTA = (path: '/register' | '/login') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path as any);
  };

  return (
    <View style={[styles.root, Platform.OS === 'web' && { alignItems: 'center', backgroundColor: '#111' }]}>
      <Animated.ScrollView
        style={Platform.OS === 'web' ? { maxWidth: 480, width: '100%' } : undefined}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ══════════════════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════════════════ */}
        <View style={styles.hero}>
          {/* Parallax background image */}
          <Animated.Image
            source={IMG.hero}
            style={[styles.heroImg, heroImgStyle]}
            resizeMode="cover"
          />
          {/* Dark overlay layers for depth */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(20,10,5,0.45)' }]} />
          <View style={[styles.heroGradient]} />

          <SafeAreaView style={styles.heroContent}>
            {/* Logo */}
            <Animated.View style={[styles.heroLogoWrap, heroLogoStyle]}>
              <View style={styles.heroLogoCircle}>
                <IconSymbol name="heart.fill" size={32} color="#FFF" />
              </View>
            </Animated.View>

            {/* Word mark */}
            <Animated.Text style={[styles.heroWordmark, heroWordStyle]}>
              sensu
            </Animated.Text>

            {/* Tagline */}
            <Animated.Text style={[styles.heroTag, heroTagStyle]}>
              Tu familia,{'\n'}siempre protegida.
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text style={[styles.heroSub, heroSubStyle]}>
              Monitoreo inteligente para adultos mayores.{'\n'}
              Paz mental para toda la familia.
            </Animated.Text>

            {/* CTAs */}
            <Animated.View style={[styles.heroCTAs, heroCTAStyle]}>
              <Animated.View style={btn1Style}>
                <AnimatedPressable
                  onPress={() => onCTA('/register')}
                  onPressIn={() =>  { ps1.value = withSpring(0.95, SPRING); }}
                  onPressOut={() => { ps1.value = withSpring(1.00, SPRING); }}
                  style={styles.heroBtnPrimary}
                >
                  <Text style={styles.heroBtnPrimaryText}>Comenzar ahora</Text>
                  <IconSymbol name="arrow.right" size={16} color="#FFF" />
                </AnimatedPressable>
              </Animated.View>

              <Animated.View style={btn2Style}>
                <AnimatedPressable
                  onPress={() => onCTA('/login')}
                  onPressIn={() =>  { ps2.value = withSpring(0.95, SPRING); }}
                  onPressOut={() => { ps2.value = withSpring(1.00, SPRING); }}
                  style={styles.heroBtnSecondary}
                >
                  <Text style={styles.heroBtnSecondaryText}>Ya tengo cuenta</Text>
                </AnimatedPressable>
              </Animated.View>
            </Animated.View>

            {/* Scroll indicator */}
            <Animated.View style={[styles.scrollIndicator, bounceStyle]}>
              <Text style={styles.scrollIndicatorText}>Descubre más</Text>
              <IconSymbol name="chevron.down" size={20} color="rgba(255,255,255,0.7)" />
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — TRUST STATS
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.statsSection, statsStyle]}
          onLayout={e => { statsY.value = e.nativeEvent.layout.y; }}
        >
          {[
            { value: '+5,000', label: 'Familias protegidas' },
            { value: '99.9%',  label: 'Tiempo activo' },
            { value: '<30s',   label: 'Respuesta SOS' },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — FEATURES
        ══════════════════════════════════════════════════════ */}
        <View
          style={styles.section}
          onLayout={e => { featuresY.value = e.nativeEvent.layout.y; }}
        >
          <Animated.View style={featuresHeaderStyle}>
            <Text style={styles.chip}>Funcionalidades</Text>
            <Text style={styles.sectionTitle}>Todo lo que necesitas{'\n'}para cuidar sin preocuparte</Text>
            <Text style={styles.sectionSub}>
              Tecnología diseñada para dar tranquilidad real, no solo promesas.
            </Text>
          </Animated.View>

          <View style={styles.featuresGrid}>
            {([
              { icon: 'location.fill',          title: 'Localización en tiempo real', desc: 'Sabe dónde está tu familiar en todo momento con precisión GPS.' },
              { icon: 'exclamationmark.circle.fill', title: 'Botón SOS',             desc: 'Un solo toque conecta directamente con nuestro centro de atención 24/7.' },
              { icon: 'battery.25',              title: 'Alertas de batería',         desc: 'Notificaciones automáticas cuando el dispositivo necesita carga.' },
              { icon: 'waveform.path.ecg',       title: 'Detección de caídas',       desc: 'Sensores inteligentes detectan caídas y alertan a tu familia al instante.' },
            ] as const).map((f, i) => (
              <FeatureCard
                key={i}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                delay={i * 80}
                scrollY={scrollY}
                cardY={i < 2 ? featureCard0Y : featureCard2Y}
              />
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — HOW IT WORKS
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.howSection, howStyle]}
          onLayout={e => { howY.value = e.nativeEvent.layout.y; }}
        >
          <Text style={[styles.chip, { color: BRAND.creamDark, borderColor: 'rgba(245,237,228,0.3)', backgroundColor: 'rgba(245,237,228,0.1)' }]}>
            Cómo funciona
          </Text>
          <Text style={[styles.sectionTitle, { color: '#F5EDE4' }]}>
            En tres pasos,{'\n'}la tranquilidad es tuya
          </Text>

          {[
            {
              n: '01',
              img: IMG.step1,
              title: 'Adquiere el reloj Sensu',
              desc: 'Recibe el dispositivo en casa, listo para activar. Sin complicaciones técnicas.',
            },
            {
              n: '02',
              img: IMG.step2,
              title: 'Conecta y configura',
              desc: 'Descarga la app, vincula el reloj en menos de 5 minutos y agrega a tus contactos de confianza.',
            },
            {
              n: '03',
              img: IMG.step3,
              title: 'Monitorea con paz',
              desc: 'Recibe alertas en tiempo real y mantente conectado con quienes más quieres, desde donde estés.',
            },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepLeft}>
                <Text style={styles.stepNumber}>{step.n}</Text>
                {i < 2 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepRight}>
                <Image
                  source={step.img}
                  style={styles.stepImg}
                  resizeMode="cover"
                />
                <Text style={[styles.stepTitle, { color: '#F5EDE4' }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: '#A89485' }]}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — DEVICE SHOWCASE
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.section, deviceStyle]}
          onLayout={e => { deviceY.value = e.nativeEvent.layout.y; }}
        >
          <Text style={styles.chip}>El dispositivo</Text>
          <Text style={styles.sectionTitle}>Reloj Sensu:{'\n'}elegancia que cuida</Text>

          <Image
            source={IMG.watch}
            style={styles.watchImg}
            resizeMode="cover"
          />

          <View style={styles.deviceSpecs}>
            {[
              { icon: 'location.fill',    text: 'GPS de alta precisión integrado' },
              { icon: 'drop.fill',        text: 'Resistente al agua IP67' },
              { icon: 'battery.100.bolt', text: 'Batería de hasta 5 días' },
              { icon: 'waveform.path.ecg',text: 'Sensor de frecuencia cardíaca' },
              { icon: 'antenna.radiowaves.left.and.right', text: 'Conectividad 4G + WiFi + Bluetooth' },
              { icon: 'bell.fill',        text: 'Botón SOS físico de emergencia' },
            ].map((spec, i) => (
              <View key={i} style={styles.specRow}>
                <View style={styles.specIcon}>
                  <IconSymbol name={spec.icon as any} size={16} color={BRAND.orange} />
                </View>
                <Text style={styles.specText}>{spec.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — FAMILY IMAGE BANNER
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.familySection, familyStyle]}
          onLayout={e => { familyY.value = e.nativeEvent.layout.y; }}
        >
          <Image source={IMG.family} style={styles.familyImg} resizeMode="cover" />
          <View style={styles.familyOverlay} />
          <View style={styles.familyContent}>
            <Text style={styles.familyEyebrow}>Más que tecnología</Text>
            <Text style={styles.familyTitle}>Para toda la familia,{'\n'}en cada momento</Text>
            <Text style={styles.familySub}>
              Sensu conecta generaciones. Los adultos mayores tienen independencia,
              las familias tienen tranquilidad. Todos ganan.
            </Text>
            <View style={styles.familyStats}>
              {[
                { v: '24/7',  l: 'Monitoreo' },
                { v: '+50',   l: 'Ciudades' },
                { v: '4.9★',  l: 'Calificación' },
              ].map((s, i) => (
                <View key={i} style={styles.familyStat}>
                  <Text style={styles.familyStatValue}>{s.v}</Text>
                  <Text style={styles.familyStatLabel}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — TESTIMONIALS
        ══════════════════════════════════════════════════════ */}
        <View
          style={styles.section}
          onLayout={e => { testimonialsY.value = e.nativeEvent.layout.y; }}
        >
          <Animated.View style={testimonialsStyle}>
            <Text style={styles.chip}>Testimonios</Text>
            <Text style={styles.sectionTitle}>Lo que dicen{'\n'}nuestras familias</Text>
          </Animated.View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            <TestimonialCard
              avatar={IMG.av1}
              name="Carlos Rodríguez"
              role="Hijo de usuaria Sensu"
              quote="Desde que mi mamá tiene el reloj, dormimos tranquilos. Ya no nos preocupa que salga sola. La app nos avisa de todo."
            />
            <TestimonialCard
              avatar={IMG.av2}
              name="María González"
              role="Usuaria Sensu, 72 años"
              quote="Es muy fácil de usar. El botón de emergencia me da mucha seguridad cuando salgo a caminar por las mañanas."
            />
            <TestimonialCard
              avatar={IMG.av3}
              name="Roberto Silva"
              role="Cuidador familiar"
              quote="Las alertas de geofence son increíbles. Me notifica cuando mi padre sale del vecindario y puedo actuar de inmediato."
            />
          </ScrollView>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — WHY SENSU (3 pillars)
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.whySection, whyStyle]}
          onLayout={e => { whyY.value = e.nativeEvent.layout.y; }}
        >
          <Text style={styles.chip}>Por qué Sensu</Text>
          <Text style={styles.sectionTitle}>Construido con un{'\n'}propósito real</Text>

          {[
            {
              icon: 'shield.fill',
              color: '#3B82F6',
              bg: 'rgba(59,130,246,0.08)',
              title: 'Seguridad real',
              desc: 'Datos cifrados end-to-end. Servidores en México. Tu privacidad es nuestra prioridad absoluta.',
            },
            {
              icon: 'clock.fill',
              color: BRAND.orange,
              bg: 'rgba(232,122,47,0.08)',
              title: 'Siempre disponible',
              desc: 'Infraestructura con 99.9% uptime. Centro de atención 24/7. Nunca estarás solo en una emergencia.',
            },
            {
              icon: 'hand.thumbsup.fill',
              color: BRAND.success,
              bg: 'rgba(68,170,68,0.08)',
              title: 'Fácil de usar',
              desc: 'Diseñado para adultos mayores. Sin tecnicismos. Configuración en minutos, cero complicaciones.',
            },
          ].map((p, i) => (
            <View key={i} style={styles.pillar}>
              <View style={[styles.pillarIcon, { backgroundColor: p.bg }]}>
                <IconSymbol name={p.icon as any} size={26} color={p.color} />
              </View>
              <View style={styles.pillarText}>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <Text style={styles.pillarDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — ELDERLY IMAGE + QUOTE
        ══════════════════════════════════════════════════════ */}
        <View style={styles.quoteSection}>
          <Image source={IMG.elderly} style={styles.quoteImg} resizeMode="cover" />
          <View style={styles.quoteOverlay} />
          <View style={styles.quoteContent}>
            <Text style={styles.quoteMark}>"</Text>
            <Text style={styles.quoteText}>
              La tecnología más importante es aquella que hace sentir a las personas menos solas.
            </Text>
            <Text style={styles.quoteAuthor}>— Filosofía Sensu</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION 10 — FAQ
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.faqSection, faqStyle]}
          onLayout={e => { faqY.value = e.nativeEvent.layout.y; }}
        >
          <Text style={styles.chip}>Preguntas frecuentes</Text>
          <Text style={styles.sectionTitle}>Resolvemos tus{'\n'}dudas</Text>

          <FaqItem
            q="¿Cómo funciona el botón SOS?"
            a="Al presionar el botón SOS en el reloj, se envía una alerta inmediata a todos tus contactos registrados y a nuestro centro de atención. Recibirás la ubicación exacta en tiempo real."
          />
          <FaqItem
            q="¿El reloj funciona sin WiFi?"
            a="Sí. El reloj Sensu tiene conectividad 4G propia. Solo necesita señal celular para funcionar, igual que un teléfono. El WiFi es opcional para ahorrar batería."
          />
          <FaqItem
            q="¿Qué pasa si el adulto mayor no sabe usar tecnología?"
            a="El reloj está diseñado para ser extremadamente simple. Solo tiene el botón SOS visible. El resto lo manejas tú desde la app. No requiere ninguna acción del portador."
          />
          <FaqItem
            q="¿Cuánto cuesta el servicio mensual?"
            a="Contamos con planes desde $299 MXN/mes que incluyen conectividad celular, monitoreo 24/7 y atención de emergencias. El dispositivo se adquiere por separado."
          />
          <FaqItem
            q="¿Puedo vincular más de un familiar?"
            a="Sí. Desde una sola cuenta puedes gestionar múltiples dispositivos y agregar tantos contactos de emergencia como necesites, sin costo adicional."
          />
        </Animated.View>

        {/* ══════════════════════════════════════════════════════
            SECTION 11 — FINAL CTA
        ══════════════════════════════════════════════════════ */}
        <Animated.View
          style={[styles.ctaSection, ctaStyle]}
          onLayout={e => { ctaY.value = e.nativeEvent.layout.y; }}
        >
          <View style={styles.ctaInner}>
            <View style={styles.ctaIconWrap}>
              <IconSymbol name="heart.fill" size={36} color={BRAND.orange} />
            </View>
            <Text style={styles.ctaTitle}>Protege a tu familia{'\n'}desde hoy</Text>
            <Text style={styles.ctaSub}>
              Miles de familias ya duermen tranquilas.{'\n'}Es tu turno.
            </Text>

            <Animated.View style={btn3Style}>
              <AnimatedPressable
                onPress={() => onCTA('/register')}
                onPressIn={() =>  { ps3.value = withSpring(0.95, SPRING); }}
                onPressOut={() => { ps3.value = withSpring(1.00, SPRING); }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>Crear cuenta gratis</Text>
                <IconSymbol name="arrow.right" size={18} color={BRAND.primary} />
              </AnimatedPressable>
            </Animated.View>

            <Pressable onPress={() => onCTA('/login')} style={styles.ctaLogin}>
              <Text style={styles.ctaLoginText}>Ya tengo una cuenta →</Text>
            </Pressable>

            <Text style={styles.ctaDisclaimer}>
              Sin permanencia · Cancela cuando quieras
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <IconSymbol name="heart.fill" size={14} color={BRAND.light} />
          <Text style={styles.footerText}>  © 2025 Sensu · Todos los derechos reservados</Text>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.cream },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero:        { height: H, overflow: 'hidden', backgroundColor: BRAND.heroBg },
  heroImg:     { position: 'absolute', width: W, height: H + 80, top: -40 },
  heroGradient:{
    position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.55,
    backgroundColor: 'transparent',
    // Simulated gradient using shadows trick
  },
  heroContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroLogoWrap:   { marginBottom: 16 },
  heroLogoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: BRAND.orange,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: BRAND.orange, shadowOpacity: 0.5,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  heroWordmark: {
    fontSize: 42, fontWeight: '900', color: '#FFF',
    letterSpacing: 4, textTransform: 'lowercase', marginBottom: 20,
  },
  heroTag: {
    fontSize: 34, fontWeight: '800', color: '#FFF',
    textAlign: 'center', lineHeight: 42, marginBottom: 16,
  },
  heroSub: {
    fontSize: 16, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 24, marginBottom: 36,
  },
  heroCTAs:      { width: '100%', gap: 12 },
  heroBtnPrimary:{
    backgroundColor: BRAND.orange,
    height: 54, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: BRAND.orange, shadowOpacity: 0.4,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  heroBtnPrimaryText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  heroBtnSecondary: {
    height: 54, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBtnSecondaryText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  scrollIndicator: {
    position: 'absolute', bottom: 32,
    alignItems: 'center', gap: 4,
  },
  scrollIndicatorText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, letterSpacing: 1 },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsSection: {
    backgroundColor: BRAND.primary,
    flexDirection: 'row',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  stat:       { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(245,237,228,0.15)' },
  statValue:  { fontSize: 26, fontWeight: '800', color: BRAND.orange, marginBottom: 4 },
  statLabel:  { fontSize: 11, color: 'rgba(245,237,228,0.65)', textAlign: 'center', lineHeight: 15 },

  // ── Generic section ──────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 24,
    paddingVertical: 52,
    backgroundColor: BRAND.cream,
  },
  chip: {
    alignSelf: 'flex-start',
    fontSize: 12, fontWeight: '700',
    color: BRAND.orange, letterSpacing: 1.5, textTransform: 'uppercase',
    borderWidth: 1, borderColor: BRAND.border,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginBottom: 16, overflow: 'hidden',
    backgroundColor: 'rgba(232,122,47,0.07)',
  },
  sectionTitle: {
    fontSize: 30, fontWeight: '800',
    color: BRAND.text, lineHeight: 38, marginBottom: 12,
  },
  sectionSub: {
    fontSize: 15, color: BRAND.muted, lineHeight: 23, marginBottom: 32,
  },

  // ── Features ─────────────────────────────────────────────────────────────────
  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1, borderColor: BRAND.border,
    shadowColor: BRAND.text, shadowOpacity: 0.06,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
  },
  featureInner:   { padding: 20 },
  featureIconWrap:{
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(232,122,47,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  featureTitle:   { fontSize: 15, fontWeight: '700', color: BRAND.text, marginBottom: 8, lineHeight: 20 },
  featureDesc:    { fontSize: 13, color: BRAND.muted, lineHeight: 19 },

  // ── How it works ─────────────────────────────────────────────────────────────
  howSection: {
    backgroundColor: BRAND.primary,
    paddingHorizontal: 24, paddingVertical: 52,
  },
  step:      { flexDirection: 'row', marginBottom: 40, gap: 20 },
  stepLeft:  { alignItems: 'center', width: 44 },
  stepNumber:{
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: BRAND.orange,
    textAlign: 'center', lineHeight: 44,
    fontSize: 15, fontWeight: '800', color: '#FFF',
    overflow: 'hidden',
  },
  stepLine: {
    flex: 1, width: 2,
    backgroundColor: 'rgba(232,122,47,0.25)',
    marginTop: 6,
  },
  stepRight:  { flex: 1 },
  stepImg:    {
    width: '100%', height: 160, borderRadius: 16,
    marginBottom: 14, backgroundColor: '#2C1A0E',
  },
  stepTitle:  { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  stepDesc:   { fontSize: 14, lineHeight: 21 },

  // ── Device ───────────────────────────────────────────────────────────────────
  watchImg: {
    width: '100%', height: 260,
    borderRadius: 24, marginVertical: 28,
    backgroundColor: BRAND.border,
  },
  deviceSpecs: { gap: 14 },
  specRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  specIcon:    {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(232,122,47,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  specText: { flex: 1, fontSize: 15, color: BRAND.text, fontWeight: '500' },

  // ── Family banner ─────────────────────────────────────────────────────────────
  familySection: { height: 480, overflow: 'hidden' },
  familyImg:     { position: 'absolute', width: W, height: 480 },
  familyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,5,0.62)' },
  familyContent: {
    flex: 1, justifyContent: 'flex-end',
    padding: 28, paddingBottom: 36,
  },
  familyEyebrow:{ fontSize: 12, fontWeight: '700', color: BRAND.orange, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  familyTitle:  { fontSize: 30, fontWeight: '800', color: '#FFF', lineHeight: 38, marginBottom: 12 },
  familySub:    { fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 22, marginBottom: 24 },
  familyStats:  { flexDirection: 'row', gap: 28 },
  familyStat:   {},
  familyStatValue: { fontSize: 24, fontWeight: '800', color: BRAND.orange },
  familyStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  // ── Testimonials ──────────────────────────────────────────────────────────────
  testimonialsScroll: { paddingHorizontal: 24, gap: 16, paddingBottom: 8 },
  testimonialCard: {
    width: Math.min(W * 0.78, 360),
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1, borderColor: BRAND.border,
    shadowColor: BRAND.text, shadowOpacity: 0.07,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  stars:            { flexDirection: 'row', gap: 3, marginBottom: 14 },
  testimonialQuote: { fontSize: 15, color: BRAND.text, lineHeight: 23, marginBottom: 18, fontStyle: 'italic' },
  testimonialAuthor:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.border },
  testimonialName:  { fontSize: 14, fontWeight: '700', color: BRAND.text },
  testimonialRole:  { fontSize: 12, color: BRAND.muted, marginTop: 2 },

  // ── Why Sensu ─────────────────────────────────────────────────────────────────
  whySection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24, paddingVertical: 52,
  },
  pillar: {
    flexDirection: 'row', gap: 16,
    marginBottom: 24,
    backgroundColor: BRAND.cream,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1, borderColor: BRAND.border,
  },
  pillarIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  pillarText:  { flex: 1 },
  pillarTitle: { fontSize: 16, fontWeight: '700', color: BRAND.text, marginBottom: 6 },
  pillarDesc:  { fontSize: 13, color: BRAND.muted, lineHeight: 19 },

  // ── Quote section ─────────────────────────────────────────────────────────────
  quoteSection: { height: 360, overflow: 'hidden' },
  quoteImg:     { position: 'absolute', width: W, height: 360 },
  quoteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,5,0.70)' },
  quoteContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  quoteMark:   { fontSize: 80, color: BRAND.orange, lineHeight: 72, fontWeight: '900' },
  quoteText:   { fontSize: 20, fontWeight: '600', color: '#FFF', textAlign: 'center', lineHeight: 30, marginBottom: 16 },
  quoteAuthor: { fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 },

  // ── FAQ ───────────────────────────────────────────────────────────────────────
  faqSection: {
    backgroundColor: BRAND.cream,
    paddingHorizontal: 24, paddingVertical: 52,
  },
  faqItem: {
    backgroundColor: '#FFF',
    borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: BRAND.border,
    paddingHorizontal: 20, paddingVertical: 18,
    shadowColor: BRAND.text, shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  faqQ: { flex: 1, fontSize: 15, fontWeight: '700', color: BRAND.text, lineHeight: 21 },
  faqA: { fontSize: 14, color: BRAND.muted, lineHeight: 22, marginTop: 12 },

  // ── CTA ───────────────────────────────────────────────────────────────────────
  ctaSection: {
    backgroundColor: BRAND.primary,
    paddingVertical: 60, paddingHorizontal: 24,
  },
  ctaInner:   { alignItems: 'center' },
  ctaIconWrap:{
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(232,122,47,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 32, fontWeight: '900',
    color: '#F5EDE4', textAlign: 'center', lineHeight: 40,
    marginBottom: 14,
  },
  ctaSub: {
    fontSize: 16, color: 'rgba(245,237,228,0.65)',
    textAlign: 'center', lineHeight: 24, marginBottom: 36,
  },
  ctaBtn: {
    backgroundColor: BRAND.orange,
    height: 58, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingHorizontal: 36,
    shadowColor: BRAND.orange, shadowOpacity: 0.4,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ctaBtnText:     { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  ctaLogin:       { marginTop: 20 },
  ctaLoginText:   { fontSize: 15, color: 'rgba(245,237,228,0.55)', fontWeight: '500' },
  ctaDisclaimer:  { marginTop: 24, fontSize: 12, color: 'rgba(245,237,228,0.35)', letterSpacing: 0.3 },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: BRAND.heroBg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20,
  },
  footerText: { fontSize: 12, color: BRAND.light },
});
